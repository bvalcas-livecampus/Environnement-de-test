const { Client } = require('pg')
const dotenv = require('dotenv')

let client 
dotenv.config()
jest.setTimeout(30000)

describe('User with PG', () => {
    beforeAll(async () => {
        client = new Client({connectionString: process.env.DATABASE_URLPG})
        await client.connect()
        
        await client.query(`CREATE TABLE "users" (
            id SERIAL PRIMARY KEY, 
            name TEXT, 
            email TEXT UNIQUE
            );
        `)
    })
    afterEach(async () => {
        await client.query('DELETE FROM users')
    })
    afterAll(async () => {
        client.end()
    })
    test("New user", async() => {
        const res = await client.query('INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *;', ['Obi', 'obiwan@hellothere.fr'])
        
        expect(res.rows[0]).toHaveProperty('id')
        expect(res.rows[0].name).toBe('Obi')
    })
    test("Empty Table", async() => {
        const res = await client.query('SELECT * FROM users;')
        
        expect(res.rows.length).toBe(0)
    })

})