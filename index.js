
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


function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'Unauthorized access' });
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'Forbidden access' })
        }
        req.decoded = decoded;
        next();
    });
}



async function run() {
    try {
        await client.connect();
        const productCollection = client.db('manufacturerCompany').collection('products');
        const reviewCollection = client.db('manufacturerCompany').collection('reviews');
        const userCollection = client.db('manufacturerCompany').collection('user');
        const orderCollection = client.db('manufacturerCompany').collection('orders');
        const profileCollection = client.db('manufacturerCompany').collection('profile');

        // ----------------Make Admin
        const verifyAdmin = async (req, res, next) => {
            const requester = req.decoded.email;
            const requesterAccount = await userCollection.findOne({ email: requester });
            if (requesterAccount.role === 'admin') {
              next();
            }
            else {
              res.status(403).send({ message: 'forbidden' });
            }
          }


        // ----------------all GET APT
        app.get('/product', async (req, res) => {
            const products = await productCollection.find().toArray();
            res.send(products);
        })

        app.get('/product/:id', verifyJWT, async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const product = await productCollection.findOne(query);
            res.send(product);
        })

        app.get('/review', async (req, res) => {
            const review = await reviewCollection.find().toArray();
            res.send(review);
        })

        app.get('/orders', async (req, res) => {
            const orders = await orderCollection.find().toArray();
            res.send(orders);
        })

        app.get('/user', async (req, res) => {
            const user = await userCollection.find().toArray();
            res.send(user);
        })

        // app.get('/profile', async (req, res) => {
        //     const email = req.query.email;
        //     const profileInfo = await orderCollection.find({email}).toArray();
        //     console.log(profileInfo);
        //     res.send(profileInfo);
        // })


        // ---------------All POST API 
        app.post('/product', async (req, res) => {
            const product = req.body;
            const result = await productCollection.insertOne(product);
            return res.send({ success: true, result });
        })

        app.post('/orders', async (req, res) => {
            const order = req.body;
            const result = await orderCollection.insertOne(order);
            return res.send({ success: true, result });
        })

        app.post('/review', async (req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review);
            return res.send(result);
        })

        // app.patch('/profile', async (req, res) => {
        //     const query = req.params.email;
        //     const profile = req.body;
        //     const updatedDoc = {
        //         $set: {profile},
        //       }
        //     const result = await profileCollection.insertOne(profile);
        //     return res.send(result);
        // })


        // ---------------PUT API

        app.put('/user/:email', async (req, res) => {
            const email = req.params.email;
            const user = req.body;
            const filter = { email: email };
            const options = { upsert: true };
            const doc = {
                $set: user,
            };
            const result = await userCollection.updateOne(filter, doc, options);
            const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' })
            res.send({ result, token });
        })

        app.put('/user/admin/:email', verifyJWT, async (req, res) => {
            const email = req.params.email;
            const filter = { email: email };
            const updateDoc = {
              $set: { role: 'admin' },
            };
            const result = await userCollection.updateOne(filter, updateDoc);
            res.send(result);
      
          })




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