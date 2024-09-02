const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const cors = require("cors");
const app = express();
const port = process.env.PORT || 4000;

// middlewares
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wy9csda.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const productsCollection = client.db("endgame").collection("products");

const dbConnect = async () => {
  try {
    client.connect();
    console.log("Database Connected Successfully✅");
  } catch (error) {
    console.log(error.name, error.message);
  }
};

dbConnect();

app.get("/api/products", async (req, res) => {
  const { name, page = 1, limit = 9, sort, category, brand } = req.query;

  const query = {};

  if (name) {
    query.name = { $regex: name, $options: "i" };
  }

  if (category) {
    query.category = category;
  }

  if (brand) {
    query.brand = brand;
  }

  const sortOption = sort === "asc" ? 1 : -1;

  const total = await productsCollection.countDocuments(query);

  const products = await productsCollection
    .find(query)
    .sort({ price: sortOption })
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit))
    .toArray();

  res.json({ total, products });
});

app.get("/", (req, res) => {
  res.send("Server is up and running");
});

app.listen(port, () => {
  console.log("The server is running on port:", port);
});
