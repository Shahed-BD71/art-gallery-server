const express = require("express");
const bodyParser = require("body-parser");
const cors = require('cors');
const fileUpload = require("express-fileupload");
const ObjectId = require('mongodb').ObjectId;
require("dotenv").config();

// middleware
const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(fileUpload());
const port = process.env.PORT || 5000;

// Connect Mongodb in Project
const { MongoClient } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.gpz9o.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true, useUnifiedTopology: true, });
  
client.connect((err) => {
  const productCollection = client.db("art-gallery").collection("products");
  const artistCollection = client.db("art-gallery").collection("artists");
  const orderCollection = client.db("art-gallery").collection("orders"); 


app.post('/addProducts', (req, res) => {
    const file = req.files.file;
    const name = req.body.name;
    const price = req.body.price;
    const description = req.body.description;
    const newImg = file.data;
    const encImg = newImg.toString("base64");

    var image = {
      contentType: file.mimetype,
      size: file.size,
      img: Buffer.from(encImg, "base64")
    };

    productCollection
      .insertOne({ name, price, description, image })
      .then((result) => {
        res.send(result.insertedCount > 0);
      });
  });


app.get("/products", (req, res) => {
    productCollection.find({})
    .toArray((err, documents) => {
      res.send(documents);
    });
  });

app.get('/product/:id', (req, res) => {
    const id = req.params.id;
    productCollection.find({ _id: ObjectId(id) })
    .toArray((err, documents) => {
     res.send(documents[0]);
  })
})


// order section/////
 app.post('/order', (req, res) => {
    const orders = req.body;
    orderCollection.insertOne(orders, (err, result) => {
        res.send({ count: result.insertedCount });
    })
})
 
 app.get('./orders', (req, res) => {
    orderCollection.find({})
    .toArray((err, documents) => {
      res.send(documents);
    })
 })

 app.get('/order/:email', (req, res) => {
     const email = req.params.email;
      orderCollection.find({email: email })
      .toArray((err, documents) => {
      res.send(documents);
      })
    })

  app.delete('/deleteOrder/:id', (req, res) => {
      const id = req.params.id;
      orderCollection.deleteOne({_id: ObjectId(id)}, (err, result) => {
        if(!err) {
          res.send({count: result.insertedCount})
        }
      })
  })


// Admin & artist
app.post("/addArtist", (req, res) => {
  const file = req.files.file;
  const name = req.body.name;
  const email = req.body.email;
  const position = req.body.position;
  const facebook = req.body.facebook;
  const instagram = req.body.instagram
  const linkedin = req.body.linkedin;
  const phone = req.body.phone;
  const newImg = file.data;
  const encImg = newImg.toString("base64");

  var image = {
    contentType: file.mimetype,
    size: file.size,
    img: Buffer.from(encImg, "base64"),
  };

  artistCollection.insertOne({ name, email, position, facebook, linkedin, instagram, phone, image })
    .then((err, result) => {
      console.log(err, result)
      res.send(result.insertedCount > 0);
    });
  });

  app.get("/artists", (req, res) => {
    artistCollection.find({})
      .toArray((err, documents) => {
      res.send(documents);
    });
  });


 app.post("/isArtist", (req, res) => {
    const email = req.body.email;
    artistCollection.find({ email: email })
    .toArray((err, artists) => {
     res.send(artists.length > 0);
   });
 });
});


  // Root API.....
app.get("/", (req, res) => {
  res.send("Hello from Server, it's working!!");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});