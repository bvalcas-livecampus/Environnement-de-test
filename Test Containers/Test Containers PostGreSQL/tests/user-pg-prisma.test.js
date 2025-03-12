//DÉBUT DE PARTIE DEPENDANCE => TEST CONTAINERS
//const { PostgreSqlContainer } = require('@testcontainers/postgresql')
//FIN DE PARTIE DEPENDANCE => TEST CONTAINERS
const { PrismaClient } = require('@prisma/client')
const dotenv = require('dotenv')

dotenv.config()

//DÉBUT DE PARTIE CONTENT => TEST CONTAINERS
let prisma
jest.setTimeout(30000)
//FIN DE PARTIE CONTENT => TEST CONTAINERS

describe("User with Prisma - PG", () => {
    beforeAll(async () => {
        console.log('Test Start')
        //DÉBUT DE PARTIE BEFORE => TEST CONTAINERS
        /*
        container = await new PostgreSqlContainer()
            .withDatabase('test')
            .start()
        databaseUrl = container.getConnectionUri()
        */
        //FIN DE PARTIE BEFORE => TEST CONTAINERS
        prisma = new PrismaClient({
            datasources: {
                db : {url: process.env.DATABASE_URL}
            }
        })
        await prisma.$executeRaw`CREATE TABLE "User" (id SERIAL PRIMARY KEY, name TEXT, email TEXT UNIQUE)`

    })
    afterAll(async () => {
        //if(container){
            await prisma.$executeRaw`DROP TABLE "User"`
            await prisma.$disconnect()
            //DÉBUT DE PARTIE AFTER => TEST CONTAINERS
            //await container.stop()
            //FIN DE PARTIE AFTER => TEST CONTAINERS
        //}
    })
    test("create a user", async() => {
        const user = await prisma.user.create({
            data: {name : "Obi", email: "obiwan@hellothere.fr"},
        })

        expect(user).toHaveProperty("id")
        expect(user.name).toBe("Obi")
    })
})