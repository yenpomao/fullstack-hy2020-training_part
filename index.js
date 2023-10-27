import express, { json } from 'express'
import cors from 'cors'
import * as dotenv from 'dotenv'
dotenv.config()
import Note from './models/note.js'
const app = express()
const requestLogger = (request, response, next) => {
  console.log('Method:', request.method)
  console.log('Path:  ', request.path)
  console.log('Body:  ', request.body)
  console.log('---')
  next()
}

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } 

  next(error)
}

app.use(cors())
app.use(json())
app.use(requestLogger)
app.use(errorHandler)
// app.use(static('build'))

let notes = [
]


app.get('/api/notes', (request, response) => {
  Note.find({}).then(notes => {
    response.json(notes)
  })
})

app.post('/api/notes', (request, response) => {
  const body = request.body

  if (body.content === undefined) {
    return response.status(400).json({ error: 'content missing' })
  }

  const note = new Note({
    content: body.content,
    important: body.important || false,
  })

  note.save().then(savedNote => {
    response.json(savedNote)
  })
})

app.get('/api/notes/:id', (request, response, next) => {
  Note.findById(request.params.id).then(note => {
    if (note) {
      response.json(note)
    }
    else {
      response.status(404).end()
    }
    
  })
  .catch(error => next(error))
})
  

app.delete('/api/notes/:id', (request, response) => {
  Note.findByIdAndRemove(request.params.id).then(result => {
    response.status(204).end()
  })
  .catch(error => next(error))
})

app.put('/api/notes/:id', (request, response, next) => {
  const body = request.body

  const note = {
    content: body.content,
    important: body.important,
  }

  Note.findByIdAndUpdate(request.params.id, note, { new: true })
    .then(updatedNote => {
      response.json(updatedNote)
    })
    .catch(error => next(error))
})  

app.use(unknownEndpoint)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})