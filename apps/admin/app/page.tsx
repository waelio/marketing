export default function AdminPage() {
    return (
        <main style={{ padding: '3rem', fontFamily: 'system-ui, sans-serif', background: '#0f172a', color: '#f8fafc', minHeight: '100vh' }}>
            <div style={{ maxWidth: 720, margin: '0 auto', borderRadius: 24, padding: 32, background: '#111827' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: 16 }}>Wælio Admin</h1>
                <p style={{ lineHeight: 1.8, color: '#cbd5e1' }}>
                    This is the admin panel placeholder. The API and web launcher are available in the monorepo.
                </p>
                <p style={{ marginTop: 24, color: '#94a3b8' }}>
                    Run <code style={{ background: '#1e293b', padding: '0.2rem 0.4rem', borderRadius: 6 }}>npm run dev:admin</code> to start this panel.
                </p>
            </div>
        </main>
    );
}
