export default function NotApprovedPage() {
    return (
        <main style={{ maxWidth: 720, margin: "80px auto", padding: 24, textAlign: "center" }}>
            <h1 style={{ fontSize: 28, marginBottom: 12 }}>Private Alpha</h1>

            <p style={{ fontSize: 16, lineHeight: 1.6 }}>
                Sorry — Line Dance Colorado is currently open only to approved alpha testers.
            </p>

            <p style={{ fontSize: 16, lineHeight: 1.6, marginTop: 8 }}>
                If you think you should have access, please contact us.
            </p>

            <div style={{ marginTop: 28 }}>
                <a
                    href="https://linedancecolorado.com"
                    style={{
                        display: "inline-block",
                        padding: "12px 16px",
                        borderRadius: 10,
                        textDecoration: "none",
                        border: "1px solid currentColor",
                    }}
                >
                    Go to linedancecolorado.com
                </a>
            </div>
        </main>
    );
}
