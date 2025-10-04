// Simple Vercel serverless function to proxy Reddit JSON and avoid CORS.
module.exports = async (req, res) => {
  try {
    const r = await fetch('https://www.reddit.com/r/reactjs.json', { headers: { 'User-Agent': 'Vercel-Proxy' } })
    if (!r.ok) {
      res.status(r.status).send(`Upstream error: ${r.status} ${r.statusText}`)
      return
    }
    const data = await r.json()
    // cache on the edge for a short time
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300')
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.status(200).json(data)
  } catch (err) {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.status(500).json({ error: err.message || 'proxy error' })
  }
}
