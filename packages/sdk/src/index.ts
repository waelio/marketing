type Ad = {
    placementId: string;
    creative: string;
    url: string;
    image: string;
};

export async function loadAd(placementId: string, container: HTMLElement): Promise<void> {
    const response = await fetch(`http://localhost:4000/api/ads?placementId=${encodeURIComponent(placementId)}`);
    const ad: Ad = await response.json();

    container.innerHTML = `
    <a href="${ad.url}" target="_blank" rel="noopener noreferrer" style="display:block; color:#0f172a; text-decoration:none;">
      <img src="${ad.image}" alt="${ad.creative}" style="width:100%; border-radius:16px; display:block;" />
      <div style="padding:12px; background:#e2e8f0; border-radius:0 0 16px 16px; font-family:system-ui,sans-serif; color:#0f172a;">
        <strong style="display:block; margin-bottom:8px;">${ad.creative}</strong>
        <span>Click to visit advertiser</span>
      </div>
    </a>
  `;
}
