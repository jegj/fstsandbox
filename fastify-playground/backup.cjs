const fastify = require('fastify') // [1]
const serverOptions = {
  logger: {
    level: 'debug',
    transport: {
      target: 'pino-pretty'
    }  }
}
const app = fastify(serverOptions) // [3]
app.listen({
  port: 8080,
  host: '0.0.0.0'
})
  .then((address) => { // [4]
    // Server is now listening on ${address}
  })

app.route({
  url: '/hello',
  method: 'GET',
  handler: function myHandler(request, reply) {
    reply.send('world')
  }
})

const cats = []
app.post('/cat', function saveCat(request, reply) {
  cats.push(request.body)
  reply.code(201).send({ allCats: cats })
})

app.get('/cat/:catName', function readCat(request, reply) {
  const lookingFor = request.params.catName
  const result = cats.find(cat => cat.name == lookingFor)
  if (result) {
    return { cat: result }
  } else {
    reply.code(404)
    throw new Error(`cat ${lookingFor} not found`)
  }
})
