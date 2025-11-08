export default function Page() {
    return (
        <main style={{ padding: 24, maxWidth: 960, margin: "0 auto", fontFamily: "system-ui, sans-serif" }}>
            <header>
                <h1 style={{ margin: 0, fontSize: 28 }}>Community</h1>
                <p style={{ marginTop: 8, color: "#555" }}>Connect with others, share updates, and discuss topics.</p>
            </header>

            <div style={{ marginTop: 16 }}>
                
            </div>

            <section style={{ marginTop: 24 }}>
                <h2 style={{ fontSize: 18, marginBottom: 8 }}>Recent posts</h2>
                <ul style={{ paddingLeft: 20, color: "#333" }}>
                    <li>No posts yet — be the first to contribute.</li>
                </ul>
            </section>
        </main>
    );
}