const { PostgreSqlContainer } = require('@testcontainers/postgresql')
const dotenv = require('dotenv')

dotenv.config()

let container
let containerpg
let databaseUrl

beforeAll(async () => {
    // Config Prisma :
    container = await new PostgreSqlContainer()
                .withDatabase('test')
                .start()
    databaseUrl = container.getConnectionUri()
    process.env.DATABASE_URL = databaseUrl
    // Config PG :
    containerpg = await new PostgreSqlContainer()
        .withDatabase('testpg')
        .start()
    databaseUrlPG = container.getConnectionUri()
    process.env.DATABASE_URLPG = databaseUrlPG
})

afterAll(async () => {
    if(container){
        //DÉBUT DE PARTIE AFTER => TEST CONTAINERS
        await container.stop()
        //FIN DE PARTIE AFTER => TEST CONTAINERS
    }
    if(containerpg){
        //DÉBUT DE PARTIE AFTER => TEST CONTAINERS
        await containerpg.stop()
        //FIN DE PARTIE AFTER => TEST CONTAINERS
    }
})

module.exports = { databaseUrl }