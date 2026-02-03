import { useEffect, useState, useCallback } from "react";

const API_BASE = import.meta.env.PUBLIC_API_URL ?? "http://localhost:8080";

interface Post {
  id: number;
  title: string;
  body: string;
  created_at: string;
}

export default function PostList() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchPosts = useCallback(async () => {
    setStatus("loading");
    try {
      const res = await fetch(`${API_BASE}/posts`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: Post[] = await res.json();
      setPosts(data);
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleDelete = async (id: number) => {
    if (!confirm("この投稿を削除しますか？")) return;

    setDeletingId(id);
    try {
      const res = await fetch(`${API_BASE}/posts/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setPosts((prev) => prev.filter((p) => p.id !== id));
    } catch {
      alert("削除に失敗しました");
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Noto+Sans+JP:wght@300;400;500;600&display=swap');

        .dawn-postlist {
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
          --dawn-card-hover: rgba(30, 34, 60, 0.8);
          --dawn-error: #e06070;
          --dawn-error-bg: rgba(224, 96, 112, 0.1);
        }

        .dawn-postlist * {
          box-sizing: border-box;
        }

        .dawn-section {
          max-width: 660px;
          margin: 0 auto;
          padding: 2.5rem 1.5rem;
          font-family: 'Noto Sans JP', sans-serif;
          color: var(--dawn-text);
        }

        .dawn-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 2rem;
        }

        .dawn-heading {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.75rem;
          font-weight: 600;
          color: var(--dawn-text-bright);
          letter-spacing: 0.02em;
          margin: 0;
        }

        .dawn-refresh-btn {
          width: 38px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          background: var(--dawn-accent-soft);
          border: 1px solid var(--dawn-card-border);
          border-radius: 10px;
          cursor: pointer;
          color: var(--dawn-accent);
          transition: all 0.25s ease;
          backdrop-filter: blur(8px);
        }

        .dawn-refresh-btn:hover {
          background: rgba(180, 142, 173, 0.25);
          border-color: rgba(180, 142, 173, 0.3);
          transform: rotate(45deg);
        }

        .dawn-status-text {
          color: var(--dawn-text-dim);
          font-size: 0.9rem;
          font-weight: 300;
          letter-spacing: 0.05em;
          animation: dawn-pulse 2s ease-in-out infinite;
        }

        @keyframes dawn-pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }

        .dawn-error-box {
          padding: 1rem 1.25rem;
          background: var(--dawn-error-bg);
          border: 1px solid rgba(224, 96, 112, 0.2);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: var(--dawn-error);
          font-size: 0.9rem;
          backdrop-filter: blur(8px);
        }

        .dawn-retry-btn {
          padding: 0.4rem 1rem;
          font-size: 0.8rem;
          font-weight: 500;
          background: rgba(224, 96, 112, 0.15);
          color: var(--dawn-error);
          border: 1px solid rgba(224, 96, 112, 0.3);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          letter-spacing: 0.04em;
        }

        .dawn-retry-btn:hover {
          background: rgba(224, 96, 112, 0.25);
        }

        .dawn-empty-text {
          color: var(--dawn-text-dim);
          font-size: 0.9rem;
          text-align: center;
          padding: 3rem 0;
          font-weight: 300;
          letter-spacing: 0.05em;
        }

        .dawn-list {
          display: flex;
          flex-direction: column;
          gap: 0.875rem;
        }

        .dawn-card {
          padding: 1.25rem 1.5rem;
          background: var(--dawn-card);
          border: 1px solid var(--dawn-card-border);
          border-radius: 14px;
          transition: all 0.3s ease;
          backdrop-filter: blur(12px);
          position: relative;
          overflow: hidden;
        }

        .dawn-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(180, 142, 173, 0.2),
            transparent
          );
        }

        .dawn-card:hover {
          background: var(--dawn-card-hover);
          border-color: rgba(180, 142, 173, 0.2);
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2),
                      0 0 40px rgba(180, 142, 173, 0.04);
          transform: translateY(-1px);
        }

        .dawn-card-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 0.75rem;
        }

        .dawn-card-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.2rem;
          font-weight: 600;
          color: var(--dawn-text-bright);
          margin: 0;
          line-height: 1.45;
        }

        .dawn-delete-btn {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          background: none;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 7px;
          cursor: pointer;
          color: var(--dawn-text-dim);
          flex-shrink: 0;
          transition: all 0.2s ease;
        }

        .dawn-delete-btn:hover {
          color: var(--dawn-error);
          border-color: rgba(224, 96, 112, 0.3);
          background: var(--dawn-error-bg);
        }

        .dawn-delete-btn:disabled {
          cursor: not-allowed;
          opacity: 0.35;
        }

        .dawn-card-body {
          margin: 0.625rem 0;
          color: var(--dawn-text);
          font-size: 0.9rem;
          line-height: 1.8;
          white-space: pre-wrap;
          font-weight: 300;
        }

        .dawn-card-time {
          font-size: 0.75rem;
          color: var(--dawn-text-dim);
          letter-spacing: 0.04em;
        }

        @media (max-width: 480px) {
          .dawn-section {
            padding: 1.5rem 1rem;
          }
          .dawn-heading {
            font-size: 1.4rem;
          }
        }
      `}</style>

      <section className="dawn-postlist">
        <div className="dawn-section">
          <div className="dawn-header">
            <h2 className="dawn-heading">Posts</h2>
            <button
              onClick={fetchPosts}
              className="dawn-refresh-btn"
              title="再読み込み"
            >
              ↻
            </button>
          </div>

          {status === "loading" && (
            <p className="dawn-status-text">読み込み中...</p>
          )}

          {status === "error" && (
            <div className="dawn-error-box">
              <p style={{ margin: 0 }}>取得に失敗しました</p>
              <button onClick={fetchPosts} className="dawn-retry-btn">
                再試行
              </button>
            </div>
          )}

          {status === "ready" && posts.length === 0 && (
            <p className="dawn-empty-text">まだ投稿がありません</p>
          )}

          {status === "ready" && posts.length > 0 && (
            <div className="dawn-list">
              {posts.map((post) => (
                <article key={post.id} className="dawn-card">
                  <div className="dawn-card-header">
                    <h3 className="dawn-card-title">{post.title}</h3>
                    <button
                      onClick={() => handleDelete(post.id)}
                      disabled={deletingId === post.id}
                      className="dawn-delete-btn"
                      title="削除"
                    >
                      {deletingId === post.id ? "…" : "✕"}
                    </button>
                  </div>
                  <p className="dawn-card-body">{post.body}</p>
                  <time className="dawn-card-time">
                    {formatDate(post.created_at)}
                  </time>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
