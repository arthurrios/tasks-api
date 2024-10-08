import { Database } from "./database.js"
import { randomUUID } from 'node:crypto'
import { buildRoutePath } from "./utils/build-route-path.js"

const database = new Database()

export const routes = [
  {
    method: 'GET',
    path: buildRoutePath('/tasks'),
    handler: (req, res) => {
      const { search } = req.query
      
      const tasks = database.select('tasks', search ?  {
        title: search,
        description: search
      } : null)

      return res.end(JSON.stringify(tasks))
    }
  },
  {
    method: 'POST',
    path: buildRoutePath('/tasks'),
    handler: (req, res) => {
      const { title, description } = req.body

      if (!title || !description) {
        return res.writeHead(400).end('Title and description are required')
      }

      const task = {
        id: randomUUID(),
        title,
        description,
        created_at: new Date(),
        updated_at: new Date(),
        completed_at: null
      }
  
      database.insert('tasks', task)
  
      return res.writeHead(201).end()
    }
  },
  {
    method: 'DELETE',
    path: buildRoutePath('/tasks/:id'),
    handler: (req, res) => {
      const { id } = req.params

      const task = database.selectOne('tasks', id)

      if (!task) {
        return res.writeHead(404).end('Task not found')
      }
      
      database.delete('tasks', id)

      return res.writeHead(204).end()
    }
  },
  {
    method: 'PUT',
    path: buildRoutePath('/tasks/:id'),
    handler: (req, res) => {
      const { id } = req.params
      const { title, description } = req.body

      const { created_at, completed_at } = database.selectOne('tasks', id)

      const task = database.selectOne('tasks', id)

      if (!task) {
        return res.writeHead(404).end('Task not found')
      }
      
      if (!title || !description) {
        return res.writeHead(400).end('Title and description are required')
      }

      database.update('tasks', id, {
        title,
        description,
        updated_at: new Date(),
        created_at,
        completed_at
      })

      return res.writeHead(204).end()
    }
  },
  {
    method: 'PATCH',
    path: buildRoutePath('/tasks/:id/completed'),
    handler: (req, res) => {
      const { id } = req.params

      const task = database.selectOne('tasks', id)

      if (!task) {
        return res.writeHead(404).end('Task not found')
      }

      const { completed_at, id: taskId, ...rest } = task
      
      database.update('tasks', id, {
        ...rest,
        completed_at: completed_at ? null : new Date()
      })

      return res.writeHead(204).end()
    }
  }
]