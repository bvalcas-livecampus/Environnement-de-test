const { MongoDBContainer } = require('@testcontainers/mongodb')
const mongoose = require("mongoose")
const User = require('./../models/User')
let container
jest.setTimeout(30000)


describe("Model fonctionnel MongoDB", () => { 
    beforeAll(async () => {
        container = await new MongoDBContainer("mongo:8.0.5")
            .withStartupTimeout(60000)
            .withUser("test:test")
            .start()
        console.log("MongoDB is UP on :",container.getConnectionString())
        const mongoUri = container.getConnectionString()
        console.log(`URI MONGO IS :${mongoUri}`)
        mongoose.connect(mongoUri)
            .then(() => console.log("✅ Connexion réussie !"))
            .catch(err => console.error("❌ Erreur de connexion :", err))
    })
    afterAll(async () => {
        if(mongoose.connection){
            await mongoose.connection.close()
        }
        if(container){
            await container.stop()
        }
    })

    test("doit créer un utilisateur", async () => {
        const user = new User({name: "Obi", email: "obiwan@hellothere.fr"})
        user.save()

        const foundUser = await User.findOne({email: "obiwan@hellothere.fr"})
        expect(foundUser).toBeDefined()
    })
})