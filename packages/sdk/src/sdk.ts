interface WaelioConfig {
  placementId: string;
  baseUrl: string;
}

interface AdPayload {
  impressionId: string;
  creativeId: string;
  campaignId: string;
  type: string;
  imageUrl?: string;
  htmlContent?: string;
  clickUrl: string;
  width?: number;
  height?: number;
}

class WaelioAdSlot {
  private container: HTMLElement;
  private config: WaelioConfig;
  private observer: IntersectionObserver | null = null;
  private loaded = false;

  constructor(container: HTMLElement, config: WaelioConfig) {
    this.container = container;
    this.config = config;
    this.setupLazyLoad();
  }

  private setupLazyLoad(): void {
    if ('IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting && !this.loaded) {
            this.loaded = true;
            void this.loadAd();
            this.observer?.disconnect();
          }
        },
        { rootMargin: '100px' },
      );
      this.observer.observe(this.container);
    } else {
      void this.loadAd();
    }
  }

  private async loadAd(): Promise<void> {
    const params = new URLSearchParams({
      placementId: this.config.placementId,
      device: this.detectDevice(),
      browser: this.detectBrowser(),
    });

    try {
      const res = await fetch(`${this.config.baseUrl}/api/ads?${params}`, {
        credentials: 'omit',
      });
      if (!res.ok) return;
      const ad: AdPayload = await res.json();
      if (!ad?.impressionId) return;
      this.render(ad);
      void this.trackImpression(ad.impressionId);
    } catch {
      /* no-fill */
    }
  }

  private render(ad: AdPayload): void {
    this.container.innerHTML = '';
    this.container.className = 'waelio-ad-slot';
    this.container.style.display = 'block';
    this.container.style.maxWidth = '100%';
    this.container.style.overflow = 'hidden';

    const wrap = document.createElement('div');
    wrap.className = 'waelio-ad-inner';
    wrap.style.position = 'relative';
    wrap.style.cursor = 'pointer';

    if (ad.type === 'HTML' && ad.htmlContent) {
      wrap.innerHTML = ad.htmlContent;
    } else if (ad.imageUrl) {
      const img = document.createElement('img');
      img.src = ad.imageUrl;
      img.alt = 'Advertisement';
      img.loading = 'lazy';
      img.style.maxWidth = '100%';
      img.style.height = 'auto';
      img.style.display = 'block';
      if (ad.width) img.width = ad.width;
      if (ad.height) img.height = ad.height;
      wrap.appendChild(img);
    }

    wrap.addEventListener('click', (e) => {
      e.preventDefault();
      void this.trackClick(ad.impressionId);
      window.open(ad.clickUrl, '_blank', 'noopener,noreferrer');
    });

    const label = document.createElement('span');
    label.textContent = 'Ad';
    label.style.cssText =
      'position:absolute;top:2px;right:4px;font-size:9px;color:#999;pointer-events:none;';
    wrap.appendChild(label);
    this.container.appendChild(wrap);
  }

  private async trackImpression(impressionId: string): Promise<void> {
    await fetch(`${this.config.baseUrl}/api/impression`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ impressionId }),
    }).catch(() => undefined);
  }

  private async trackClick(impressionId: string): Promise<void> {
    await fetch(`${this.config.baseUrl}/api/click`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ impressionId }),
    }).catch(() => undefined);
  }

  private detectDevice(): string {
    const ua = navigator.userAgent;
    if (/Mobile|Android|iPhone/i.test(ua)) return 'mobile';
    if (/Tablet|iPad/i.test(ua)) return 'tablet';
    return 'desktop';
  }

  private detectBrowser(): string {
    const ua = navigator.userAgent;
    if (ua.includes('Firefox')) return 'firefox';
    if (ua.includes('Edg')) return 'edge';
    if (ua.includes('Chrome')) return 'chrome';
    if (ua.includes('Safari')) return 'safari';
    return 'other';
  }
}

function init(): void {
  const scripts = document.querySelectorAll<HTMLScriptElement>('script[data-placement-id]');
  const baseUrl =
    (document.currentScript as HTMLScriptElement | null)?.src?.replace(/\/sdk\.js.*$/, '') ||
    'https://ads.waelio.com';

  scripts.forEach((script) => {
    const placementId = script.getAttribute('data-placement-id');
    if (!placementId) return;

    const container = document.createElement('div');
    container.id = `waelio-${placementId}`;
    script.parentNode?.insertBefore(container, script.nextSibling);

    new WaelioAdSlot(container, { placementId, baseUrl });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

export {};
