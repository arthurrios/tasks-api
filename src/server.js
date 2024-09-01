import http from 'node:http'

const tasks = []

const server = http.createServer(async (req, res) => {
  const { method, url } = req

  const buffers = []

  for await (const chunk of req) {
    buffers.push(chunk)
  }

  try {
    req.body = JSON.parse(Buffer.concat(buffers).toString())
  } catch {
    req.body = null
  }

  if (method === 'GET' && url === '/tasks') {
    return res
      .setHeader('Content-Type', 'application/json')
      .end(JSON.stringify(tasks))
  }

  if (method === 'POST' && url === '/tasks') {
    const { title, description } = req.body

    tasks.push({
      id: 1,
      title,
      description,
      completed_at: null
    })

    return res.writeHead(201).end()
  }

  return res.writeHead(404).end();
})

server.listen(3333)