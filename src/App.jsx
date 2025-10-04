import { useEffect, useMemo, useState } from 'react'
import './App.css'

function timeAgo(unix) {
  const diff = Math.floor(Date.now() / 1000 - unix)
  if (diff < 60) return `${diff}s`
  if (diff < 3600) return `${Math.floor(diff / 60)}m`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`
  return `${Math.floor(diff / 86400)}d`
}

function App() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [query, setQuery] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    const fetchPosts = async () => {
      try {
        setLoading(true)
        // use platform-friendly proxy path - in dev vite proxies /api/reddit to reddit,
        // and on Vercel we provide a serverless function at /api/reddit
        const res = await fetch('/api/reddit', { signal: controller.signal })
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
        const json = await res.json()
        const children = json?.data?.children || []
        setPosts(children.map((c) => c.data))
      } catch (err) {
        if (err.name !== 'AbortError') setError(err.message || 'Failed to fetch')
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
    return () => controller.abort()
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return posts
    return posts.filter((p) => (p.title + ' ' + (p.selftext || '')).toLowerCase().includes(q))
  }, [posts, query])

  return (
    <div className="app-root">
      <header className="app-header">
        <div className="brand">
          <h1>Hiring Project</h1>
          <span className="chip">Project Feed</span>
        </div>
        <p className="subtitle">Showing Title, SelfText_HTML, URL and score — beautiful, responsive cards</p>

        <div className="controls">
          <input className="search" placeholder="Search titles & text…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      </header>

      <main className="content">
        {loading && <div className="status">Loading posts…</div>}
        {error && <div className="status error">Error: {error}</div>}

        {!loading && !error && (
          <section className="grid">
            {filtered.length === 0 && <div className="empty">No posts match your search.</div>}
            {filtered.map((p) => (
              <article className="post-card" key={p.id}>
                <div className="card-head">
                  <div className="thumb">
                    {p.thumbnail && p.thumbnail.startsWith('http') ? (
                      <img src={p.thumbnail} alt="thumb" />
                    ) : (
                      <div className="thumb-fallback">R</div>
                    )}
                  </div>
                  <div className="head-meta">
                    <h2 className="post-title">{p.title}</h2>
                    <div className="meta-line">
                      <span className="author">u/{p.author}</span>
                      <span className="dot">•</span>
                      <span className="time">{timeAgo(p.created_utc)}</span>
                    </div>
                  </div>
                </div>

                <div className="post-selftext" dangerouslySetInnerHTML={{ __html: p.selftext_html || '<i>(no self text)</i>' }} />

                <div className="post-meta">
                  <a className="post-url" href={p.url} target="_blank" rel="noreferrer">Open link</a>
                  <div className="score">▲ {p.score}</div>
                </div>
              </article>
            ))}
          </section>
        )}
      </main>

      <footer className="app-footer">
        <small>Default resolution: 1280×720 (responsive). Data from reddit.com</small>
      </footer>
    </div>
  )
}

export default App
