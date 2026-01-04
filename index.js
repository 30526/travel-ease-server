const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

// mondo db url
const uri = process.env.MONGO_URI;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    const travelDB = client.db("travel_ease_db");
    const myCollection = travelDB.collection("vehicles");
    const bookingsCollection = travelDB.collection("bookings");

    app.post("/vehicles", async (req, res) => {
      const newVehicle = req.body;
      const result = await myCollection.insertOne(newVehicle);
      res.send(result);
    });

    app.get("/vehicles", async (req, res) => {
      const cursor = myCollection.find().sort({ createdAt: -1 }).limit(4);
      const vehicles = await cursor.toArray();
      res.send(vehicles);
    });

    app.get("/all-vehicles", async (req, res) => {
      const query = {};
      const email = req.query.email;
      if (email) {
        query.userEmail = email;
      }
      const cursor = myCollection.find(query).sort({ createdAt: -1 });
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/vehicles/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const vehicle = await myCollection.findOne(query);
      res.send(vehicle);
    });

    // bookings api's
    app.post("/bookings", async (req, res) => {
      const booking = req.body;
      const result = await bookingsCollection.insertOne(booking);
      res.send(result);
    });

    app.get("/bookings", async (req, res) => {
      const query = {};
      const email = req.query.email;
      if (email) {
        query.email = email;
      }
      const cursor = bookingsCollection.find(query).sort({ createdAt: -1 });
      const result = await cursor.toArray();
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } catch (err) {
    console.log(err.message);
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello, World!");
});
app.listen(port, () => {
  console.log(`Server is running on ${port}`);
});
