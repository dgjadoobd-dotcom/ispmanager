import { Hono } from 'hono'
import { cors } from 'hono/cors'

const app = new Hono()

// Enable CORS for frontend
app.use('*', cors({
  origin: ['*'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}))

// Health check
app.get('/api/health', (c) => {
  return c.json({ 
    status: 'ok', 
    service: 'cloudflare-worker',
    time: new Date().toISOString() 
  })
})

// Forward API requests to backend
app.post('/api/*', async (c) => {
  const backendUrl = c.env?.BACKEND_URL || 'http://localhost:3001'
  const path = c.req.path
  
  try {
    const response = await fetch(`${backendUrl}${path}`, {
      method: c.req.method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: await c.req.text(),
    })

    const data = await response.json()
    return c.json(data, response.status)
  } catch (err) {
    return c.json({ 
      success: false, 
      error: 'Backend unavailable' 
    }, 503)
  }
})

export default app
