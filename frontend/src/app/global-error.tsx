"use client";

/**
 * Phase 9.2: Global Error Boundary
 * Catches errors at the root layout level (unrecoverable errors)
 * Must define its own <html> and <body> tags since it replaces the root layout
 */

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily:
            'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          backgroundColor: "#0a0a0a",
          color: "#ededed",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1rem",
        }}
      >
        <div style={{ maxWidth: "28rem", width: "100%", textAlign: "center" }}>
          {/* Error Icon */}
          <div
            style={{
              marginBottom: "1.5rem",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                borderRadius: "50%",
                backgroundColor: "rgba(239, 68, 68, 0.1)",
                padding: "1rem",
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#ef4444"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
          </div>

          {/* Error Message */}
          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: "bold",
              marginBottom: "0.5rem",
            }}
          >
            Critical Error
          </h1>
          <p
            style={{
              color: "#9ca3af",
              marginBottom: "1.5rem",
            }}
          >
            A critical error occurred and we couldn't recover. Please try
            refreshing the page.
          </p>

          {/* Error Details (in development) */}
          {process.env.NODE_ENV === "development" && error.message && (
            <div
              style={{
                marginBottom: "1.5rem",
                padding: "1rem",
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                borderRadius: "0.5rem",
                textAlign: "left",
              }}
            >
              <p
                style={{
                  fontSize: "0.875rem",
                  fontFamily: "monospace",
                  color: "#ef4444",
                  wordBreak: "break-all",
                }}
              >
                {error.message}
              </p>
              {error.digest && (
                <p
                  style={{
                    fontSize: "0.75rem",
                    color: "#6b7280",
                    marginTop: "0.5rem",
                  }}
                >
                  Error ID: {error.digest}
                </p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
              alignItems: "center",
            }}
          >
            <button
              onClick={reset}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                backgroundColor: "#3b82f6",
                color: "#ffffff",
                border: "none",
                borderRadius: "0.5rem",
                padding: "0.75rem 1.5rem",
                fontSize: "0.875rem",
                fontWeight: "500",
                cursor: "pointer",
                width: "100%",
                maxWidth: "200px",
                justifyContent: "center",
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                <path d="M21 3v5h-5" />
              </svg>
              Try Again
            </button>
            <button
              onClick={() => (window.location.href = "/")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                backgroundColor: "transparent",
                color: "#ededed",
                border: "1px solid #374151",
                borderRadius: "0.5rem",
                padding: "0.75rem 1.5rem",
                fontSize: "0.875rem",
                fontWeight: "500",
                cursor: "pointer",
                width: "100%",
                maxWidth: "200px",
                justifyContent: "center",
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              Go to Home
            </button>
          </div>

          {/* Support Link */}
          <div
            style={{
              marginTop: "2rem",
              paddingTop: "2rem",
              borderTop: "1px solid #374151",
            }}
          >
            <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>
              If this problem persists, please{" "}
              <a
                href="mailto:support@party-time.app"
                style={{ color: "#3b82f6", textDecoration: "none" }}
              >
                contact support
              </a>
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}
