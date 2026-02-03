import { useState } from "react";

const API_BASE = import.meta.env.PUBLIC_API_URL ?? "http://localhost:8080";

interface PostResponse {
  id: number;
  title: string;
  body: string;
  created_at: string;
}

export default function CreatePost() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<
    "idle" | "sending" | "success" | "error"
  >("idle");
  const [created, setCreated] = useState<PostResponse | null>(null);

  const canSubmit =
    title.trim().length > 0 &&
    content.trim().length > 0 &&
    status !== "sending";

  const handleSubmit = async () => {
    if (!canSubmit) return;

    setStatus("sending");
    try {
      const res = await fetch(`${API_BASE}/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), body: content.trim() }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data: PostResponse = await res.json();
      setCreated(data);
      setStatus("success");
      setTitle("");
      setContent("");

      setTimeout(() => {
        setStatus("idle");
        setCreated(null);
      }, 3000);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Noto+Sans+JP:wght@300;400;500;600&display=swap');

        .dawn-createpost {
          --dawn-deep: #0a0e1a;
          --dawn-night: #111827;
          --dawn-indigo: #1a1f3a;
          --dawn-horizon: #2a2040;
          --dawn-glow: #3d2a50;
          --dawn-text: #c8c4d4;
          --dawn-text-dim: #7a7690;
          --dawn-text-bright: #e8e4f0;
          --dawn-accent: #b48ead;
          --dawn-accent-soft: rgba(180, 142, 173, 0.15);
          --dawn-card: rgba(22, 26, 48, 0.65);
          --dawn-card-border: rgba(180, 142, 173, 0.12);
          --dawn-input-bg: rgba(16, 20, 38, 0.6);
          --dawn-input-border: rgba(180, 142, 173, 0.12);
          --dawn-input-focus: rgba(180, 142, 173, 0.3);
          --dawn-success: #7dcea0;
          --dawn-success-bg: rgba(125, 206, 160, 0.1);
          --dawn-error: #e06070;
          --dawn-error-bg: rgba(224, 96, 112, 0.1);
        }

        .dawn-createpost * {
          box-sizing: border-box;
        }

        .dawn-create-section {
          max-width: 660px;
          margin: 0 auto;
          padding: 2.5rem 1.5rem;
          font-family: 'Noto Sans JP', sans-serif;
          color: var(--dawn-text);
        }

        .dawn-create-heading {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.75rem;
          font-weight: 600;
          margin-bottom: 2rem;
          color: var(--dawn-text-bright);
          letter-spacing: 0.02em;
        }

        .dawn-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .dawn-field {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .dawn-label {
          font-size: 0.75rem;
          font-weight: 500;
          color: var(--dawn-accent);
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .dawn-input {
          padding: 0.75rem 1rem;
          font-size: 0.95rem;
          font-family: 'Noto Sans JP', sans-serif;
          color: var(--dawn-text-bright);
          background: var(--dawn-input-bg);
          border: 1px solid var(--dawn-input-border);
          border-radius: 10px;
          outline: none;
          transition: all 0.25s ease;
          backdrop-filter: blur(8px);
        }

        .dawn-input::placeholder {
          color: var(--dawn-text-dim);
          font-weight: 300;
        }

        .dawn-input:focus {
          border-color: var(--dawn-input-focus);
          box-shadow: 0 0 0 3px rgba(180, 142, 173, 0.08),
                      0 0 20px rgba(180, 142, 173, 0.06);
        }

        .dawn-input:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .dawn-textarea {
          resize: vertical;
          line-height: 1.7;
          min-height: 140px;
        }

        .dawn-submit-btn {
          padding: 0.75rem 2rem;
          font-size: 0.9rem;
          font-weight: 500;
          font-family: 'Noto Sans JP', sans-serif;
          color: var(--dawn-text-bright);
          background: linear-gradient(
            135deg,
            rgba(180, 142, 173, 0.2),
            rgba(100, 80, 140, 0.25)
          );
          border: 1px solid rgba(180, 142, 173, 0.25);
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.3s ease;
          align-self: flex-start;
          letter-spacing: 0.04em;
          backdrop-filter: blur(8px);
          position: relative;
          overflow: hidden;
        }

        .dawn-submit-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(180, 142, 173, 0.3),
            transparent
          );
        }

        .dawn-submit-btn:hover:not(:disabled) {
          background: linear-gradient(
            135deg,
            rgba(180, 142, 173, 0.3),
            rgba(100, 80, 140, 0.35)
          );
          border-color: rgba(180, 142, 173, 0.4);
          box-shadow: 0 4px 20px rgba(180, 142, 173, 0.1);
          transform: translateY(-1px);
        }

        .dawn-submit-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .dawn-submit-btn:disabled {
          opacity: 0.35;
          cursor: not-allowed;
          transform: none;
        }

        .dawn-success-msg {
          padding: 0.85rem 1.15rem;
          background: var(--dawn-success-bg);
          border: 1px solid rgba(125, 206, 160, 0.2);
          color: var(--dawn-success);
          border-radius: 10px;
          font-size: 0.85rem;
          font-weight: 400;
          backdrop-filter: blur(8px);
          animation: dawn-fade-in 0.3s ease;
        }

        .dawn-error-msg {
          padding: 0.85rem 1.15rem;
          background: var(--dawn-error-bg);
          border: 1px solid rgba(224, 96, 112, 0.2);
          color: var(--dawn-error);
          border-radius: 10px;
          font-size: 0.85rem;
          font-weight: 400;
          backdrop-filter: blur(8px);
          animation: dawn-fade-in 0.3s ease;
        }

        @keyframes dawn-fade-in {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 480px) {
          .dawn-create-section {
            padding: 1.5rem 1rem;
          }
          .dawn-create-heading {
            font-size: 1.4rem;
          }
        }
      `}</style>

      <section className="dawn-createpost">
        <div className="dawn-create-section">
          <h2 className="dawn-create-heading">New Post</h2>

          <div className="dawn-form">
            <div className="dawn-field">
              <label className="dawn-label" htmlFor="post-title">
                Title
              </label>
              <input
                id="post-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="記事タイトル"
                className="dawn-input"
                disabled={status === "sending"}
              />
            </div>

            <div className="dawn-field">
              <label className="dawn-label" htmlFor="post-body">
                Body
              </label>
              <textarea
                id="post-body"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="本文を入力..."
                rows={6}
                className="dawn-input dawn-textarea"
                disabled={status === "sending"}
              />
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="dawn-submit-btn"
            >
              {status === "sending" ? "Posting..." : "Create Post"}
            </button>

            {status === "success" && created && (
              <div className="dawn-success-msg">
                ✓ 「{created.title}」を投稿しました (ID: {created.id})
              </div>
            )}

            {status === "error" && (
              <div className="dawn-error-msg">
                投稿に失敗しました。接続を確認してください。
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
