// REQUIRE
const express = require("express");
const { MongoClient } = require("mongodb");
const cors = require("cors");
require("dotenv").config();
const ObjectId = require("mongodb").ObjectId;
const port = process.env.PORT || 5000;
const app = express();

//MIDDLEWARE
app.use(cors());
app.use(express.json());

// OPEN API
app.get("/", async (req, res) => {
  res.send("server is running!");
});

// CONNECTION URI
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.6ijjp.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

{/* <password>@cluster0.6ijjp.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true }); */}


//DB CONNECTION
async function run() {
  try {
    await client.connect();
    const database = client.db("assignment-12"); //shoesDB
    const user_collection = database.collection("users");
    const product_collection = database.collection("products");
    const order_collection = database.collection("orders");
    const review_collection = database.collection("review");

    //#user add: post api
    app.post("/users", async (req, res) => {
      const result = await user_collection.insertOne(req.body);
      res.json(result);
    });

    //#user add: post api
    app.get("/admin/:email", async (req, res) => {
      const email = req.params.email;
      const result = await user_collection.findOne({ email: email });
      res.json(result);
    });

    //# add a new admin: post api
    app.put("/addAdmin", async (req, res) => {
      const email = req.body.email;
      const result = await user_collection.updateOne(
        { email },
        {
          $set: { role: "admin" },
        }
      );
      res.json(result);
    });

    //#all products load: get api
    app.get("/products", async (req, res) => {
      const result = await product_collection.find({}).toArray();
      res.json(result);
    });

    //#single data load: get api
    app.get("/placeorder/:id", async (req, res) => {
      const result = await product_collection.findOne({
        _id: ObjectId(req.params.id),
      });
      res.json(result);
    });

    //# place order: post api
    app.post("/placeorder", async (req, res) => {
      const order = req.body;
      order.status = "Pending";
      delete order._id;
      const result = await order_collection.insertOne(order);
      res.json(result);
    });

    //# load all orders: get api
    app.get("/orders", async (req, res) => {
      const email = req.query.email;
      let result;
      if (email) {
        result = await order_collection.find({ email }).toArray();
      } else {
        result = await order_collection.find({}).toArray();
      }
      res.json(result);
    });

    //# Change status: put api
    app.put("/updateOrderStatus", async (req, res) => {
      const id = req.body.id;
      const status = req.body.status;
      const result = await order_collection.updateOne(
        { _id: ObjectId(id) },
        {
          $set: { status: status },
        }
      );
      res.json(result.modifiedCount);
    });

    //# update a product: put api
    app.put("/updateProduct", async (req, res) => {
      const id = req.query.id;
      const product = req.body;
      const result = await product_collection.updateOne(
        { _id: ObjectId(id) },
        {
          $set: product,
        }
      );
      res.json(result);
    });

    //# delete specific order: delete api
    app.delete("/placeorder/:id", async (req, res) => {
      const result = await order_collection.deleteOne({
        _id: ObjectId(req.params.id),
      });
      res.json(result);
    });

    //# add a new product: post api
    app.post("/addProduct", async (req, res) => {
      const result = await product_collection.insertOne(req.body);
      res.json(result);
    });

    //# add a review: post api
    app.post("/addReview", async (req, res) => {
      const result = await review_collection.insertOne(req.body);
      res.json(result);
    });

    //# load all review: get api
    app.get("/reviews", async (req, res) => {
      const result = await review_collection.find({}).toArray();
      res.json(result);
    });

    //# delete a product: delete api
    app.delete("/deleteProduct/:id", async (req, res) => {
      const result = await product_collection.deleteOne({
        _id: ObjectId(req.params.id),
      });
      res.json(result);
    });

    //#single order load: get api
    app.get("/updateOne/:id", async (req, res) => {
      const result = await product_collection.findOne({
        _id: ObjectId(req.params.id),
      });
      res.json(result);
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => console.log(`server is running on port ${port}`));