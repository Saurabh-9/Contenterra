// Simple Vercel serverless function to proxy Reddit JSON and avoid CORS.
module.exports = async (req, res) => {
  try {
    // Use a browser-like user-agent and common headers to reduce the chance Reddit blocks the request
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      Accept: 'application/json, text/javascript, */*; q=0.01',
      Referer: 'https://www.reddit.com/',
    }

  let r = await fetch('https://www.reddit.com/r/reactjs.json', { headers })

    // Debug logs for Vercel function — upstream status and content-type
    console.log(`[reddit-proxy] upstream status=${r.status} ${r.statusText}`)
    const contentType = r.headers.get('content-type') || ''
    console.log(`[reddit-proxy] upstream content-type=${contentType}`)

    // If upstream returns 403 and we have Reddit app credentials, try OAuth fallback
    if (!r.ok && r.status === 403 && process.env.REDDIT_CLIENT_ID && process.env.REDDIT_CLIENT_SECRET) {
      console.warn('[reddit-proxy] upstream returned 403 — attempting OAuth client_credentials fallback')
      try {
        const id = process.env.REDDIT_CLIENT_ID
        const secret = process.env.REDDIT_CLIENT_SECRET
        const basic = Buffer.from(`${id}:${secret}`).toString('base64')
        const tokenRes = await fetch('https://www.reddit.com/api/v1/access_token', {
          method: 'POST',
          headers: {
            Authorization: `Basic ${basic}`,
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': headers['User-Agent'],
          },
          body: 'grant_type=client_credentials',
        })

        console.log(`[reddit-proxy] token endpoint status=${tokenRes.status}`)
        if (tokenRes.ok) {
          const tok = await tokenRes.json()
          const token = tok.access_token
          const oheaders = {
            Authorization: `Bearer ${token}`,
            'User-Agent': headers['User-Agent'],
            Accept: 'application/json',
          }
          // Use the OAuth endpoint
          r = await fetch('https://oauth.reddit.com/r/reactjs.json', { headers: oheaders })
          console.log(`[reddit-proxy] oauth fetch status=${r.status}`)
        } else {
          const ttext = await tokenRes.text().catch(() => '')
          console.error('[reddit-proxy] token request failed', tokenRes.status, ttext.slice(0,200))
        }
      } catch (e) {
        console.error('[reddit-proxy] oauth fallback error', e?.message || e)
      }
    }

    // If upstream still non-OK, forward status and a small message to help debugging
    if (!r.ok) {
      const text = await r.text().catch(() => '')
      console.error(`[reddit-proxy] upstream error ${r.status} ${r.statusText}: ${text.slice(0,200)}`)
      res.setHeader('Access-Control-Allow-Origin', '*')
      res.status(r.status).send(`Upstream error: ${r.status} ${r.statusText}\n${text.slice(0, 200)}`)
      return
    }

    // Try to parse JSON; if parse fails, forward text
    let payload
    if (contentType.includes('application/json')) {
      payload = await r.json()
    } else {
      const text = await r.text()
      try {
        payload = JSON.parse(text)
      } catch (e) {
        console.error('[reddit-proxy] upstream returned non-JSON body')
        // upstream returned HTML or unexpected content
        res.setHeader('Access-Control-Allow-Origin', '*')
        res.status(502).send('Upstream did not return JSON')
        return
      }
    }

    // Log number of posts if available
    try {
      const count = Array.isArray(payload?.data?.children) ? payload.data.children.length : undefined
      console.log(`[reddit-proxy] fetched posts=${count}`)
    } catch (e) {
      console.log('[reddit-proxy] could not determine posts count')
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
