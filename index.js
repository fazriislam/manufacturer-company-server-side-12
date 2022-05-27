
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json())




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@company-owner.zklwg.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });





async function run() {
    try {
        await client.connect();
        const productCollection = client.db('manufacturerCompany').collection('products');
        const reviewCollection = client.db('manufacturerCompany').collection('reviews');
        const userCollection = client.db('manufacturerCompany').collection('user');
        const orderCollection = client.db('manufacturerCompany').collection('orders');


        // ----------------all GET APT
        app.get('/product', async (req, res) => {
            const products = await productCollection.find().toArray();
            res.send(products);
        })

        app.get('/product/:id', async (req, res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)}
            const product = await productCollection.findOne(query);
            res.send(product);
        })

        app.get('/review', async (req, res) => {
            const review = await reviewCollection.find().toArray();
            res.send(review);
        })

        app.get('/orders', async (req,res)=>{
            const orders = await orderCollection.find().toArray();
            res.send(orders);
        })

        
        // ---------------All POST API
        app.post('/orders',async (req,res)=>{
            const order = req.body;
            const result = await orderCollection.insertOne(order);
            return res.send({ success: true, result });
        })


        // ---------------PUT API


        
    }


    finally {

    }
}


run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('App is running for assignment 12')
})

app.listen(port, () => {
    console.log(`App is listening ${port}`)
})