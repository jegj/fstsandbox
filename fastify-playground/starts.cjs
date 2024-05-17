const Fastify = require('fastify')
const usersRouter = require('./users-router.cjs')
const myPlugin = require('./fp-myplugin.cjs')

const serverOptions = {
  logger: {
    level: 'debug',
    transport: {
      target: 'pino-pretty'
    }  }
}

const app = Fastify(serverOptions) 

app.decorate('users', [ 
  {
    name: 'Sam',
    age: 23,
  },
  {
    name: 'Daphne',
    age: 21,
  },
])

app.decorate('root', 'root decorator')

app.register(myPlugin)
app.register(usersRouter, { prefix: 'v1' }) // [2]
app.register(
  async function usersRouterV2(fastify, options) { // [3]
    fastify.register(usersRouter) // [4]
    fastify.delete('/users/:name', (request, reply) => { //
    [5]
      const userIndex = fastify.users.findIndex(
        user => user.name === request.params.name,
      )
      fastify.users.splice(userIndex, 1)
      reply.send()
    })
  },
  { prefix: 'v2' },
)
// Sync plugin registration, call done
app.register(function myPlugin(fastify,_, done) {
  fastify.log.info("trying to register my first plugin")
  //done()
}).after(err => {
  if ( err) {
      app.log.error(`${err.message} - error loading plugin. Skipping...`, err)
   }
})
/*
app.register(async function (fastify, opts) { // [2]
    app.log.info('Registering my first plugin.')
})
*/

app.listen({
  port: 8080,
  host: '0.0.0.0'
})

app.ready()
  .then(() => { app.log.info(app.printRoutes()) })
