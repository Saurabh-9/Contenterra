// Simple Vercel serverless function to proxy Reddit JSON and avoid CORS.
module.exports = async (req, res) => {
  try {
    // Use a browser-like user-agent and common headers to reduce the chance Reddit blocks the request
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      Accept: 'application/json, text/javascript, */*; q=0.01',
      Referer: 'https://www.reddit.com/',
    }

    const r = await fetch('https://www.reddit.com/r/reactjs.json', { headers })

    // If upstream returns non-OK, forward status and a small message to help debugging
    if (!r.ok) {
      const text = await r.text().catch(() => '')
      res.setHeader('Access-Control-Allow-Origin', '*')
      res.status(r.status).send(`Upstream error: ${r.status} ${r.statusText}\n${text.slice(0, 200)}`)
      return
    }

    // Try to parse JSON; if parse fails, forward text
    const contentType = r.headers.get('content-type') || ''
    let payload
    if (contentType.includes('application/json')) {
      payload = await r.json()
    } else {
      const text = await r.text()
      try {
        payload = JSON.parse(text)
      } catch (e) {
        // upstream returned HTML or unexpected content
        res.setHeader('Access-Control-Allow-Origin', '*')
        res.status(502).send('Upstream did not return JSON')
        return
      }
    }

    // cache on the edge for a short time
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300')
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.status(200).json(payload)
  } catch (err) {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.status(500).json({ error: err.message || 'proxy error' })
  }
}
