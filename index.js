const {
    MongoClient,
    ServerApiVersion,
    ObjectId
} = require('mongodb');
const express = require('express')
const cors = require('cors');
const app = express()
const port = process.env.Port || 5000;
require('dotenv').config()

// const user='wild-live'
// const password='1V7763mznG3otLiN'
// middleware using
app.use(cors());
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.scxie4k.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1
});
function verifyEmail(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).send({ message: "unauthorized access" });
    }
    const token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
      if (err) {
        return res.status(403).send({ message: "unauthorized access" });
      }
      req.decoded = decoded;
      next();
    });
  }

async function run() {
    try {
        const db=client.db('WildLive')
        // users collection
        const UserDataCollection = db.collection('userData');
        app.post("/jwt", (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
              expiresIn: "20h",
            });
            res.send({ token });
          });
        app.get('/users', async(req, res)=>{
            const query={};
            const cursor=UserDataCollection.find(query)
            const users= await cursor.toArray();
            res.send(users)
            
        })
        app.post('/users', async(req, res) => {
            const user = req.body;
            console.log(user)
            const result= await UserDataCollection.insertOne(user)
            res.send(result); 
        })
        // Banner collection
        const BannerDataCollection = db.collection('BannerData');
        app.get('/banner', async(req, res)=>{
            const bannerQuery={};
            const bannercursor=BannerDataCollection.find(bannerQuery)
            const banner=await bannercursor.toArray();
            res.send(banner)    
        })
        // Services collection
        const ServiceDataCollection = db.collection('serviceData');
        
        app.post('/services', async(req, res)=>{
            const services=req.body;
            const serviceResult=await ServiceDataCollection.insertOne(services)
            res.send(serviceResult)
        })
        app.get('/service', async(req, res)=>{
            const serviceQuery={};
            const servicesCursor=ServiceDataCollection.find(serviceQuery)
            const sort={time:-1}
            const services=await servicesCursor.sort(sort).limit(3).toArray();
            res.send(services)
        })
        app.get('/services', async(req, res)=>{
            const serviceQuery={};
            const sort={time:-1}
            const servicesCursor=ServiceDataCollection.find(serviceQuery)
            const services=await servicesCursor.sort(sort).toArray();
            res.send(services)
        })
        app.get('/services/:id', async(req, res)=>{
            const id =req.params.id;
            const serQuery={_id:ObjectId(id)}
            const service=await ServiceDataCollection.findOne(serQuery)
            res.send(service)
        })

        // rteview
        const reviewDataCollection = db.collection('reviewData');
        app.post('/reviews', async(req, res)=>{
            const review=req.body;
            const reviewResult=await reviewDataCollection.insertOne(review)
            res.send(reviewResult)
        })
        app.get('/reviews/:id', async(req, res)=>{
            const id =req.params.id;
            const serQuery={serviceId:id}
            const sort={time:-1}
            const reviewCursor=reviewDataCollection.find(serQuery)
            const review=await reviewCursor.sort(sort).toArray()
            res.send(review)
        })


        app.get('/update/:id', async(req, res)=>{
            const id =req.params.id;
            const serQuery={_id:ObjectId(id)}
            const review= await reviewDataCollection.findOne(serQuery)
            res.send(review)
        })
        app.put('/update/:id', async(req, res)=>{
            const id =req.params.id;
            const filter={_id:ObjectId(id)}
            const reviews=req.body;
            const option ={upsert:true}
            const updateReview={
                $set:{
                    date:reviews.date,
                    currentReview:reviews.currentReview
                }
            }
            const result= await reviewDataCollection.updateOne(filter, updateReview, option)
            res.send(result)
        })

        app.delete('/reviews/:id',async(req,res)=>{
            const id =req.params.id;
            const query ={_id:ObjectId(id)}
            const result =await reviewDataCollection.deleteOne(query)
            res.send(result)
        });

        app.get('/user_reviews/:id', async(req, res)=>{
            const id =req.params.id;
            const serQuery={userEmail:id}
            const sort={time:-1}
            const reviewCursor=reviewDataCollection.find(serQuery)
            const review=await reviewCursor.sort(sort).toArray()
            res.send(review)
        })
        app.get('/reviews', async(req, res)=>{
            const serQuery={}
            const reviewCursor=reviewDataCollection.find(serQuery)
            const review=await reviewCursor.limit(6).toArray()
            res.send(review)
        })
        
    } finally {

    }
}
run().catch(error => console.log(error))

app.get('/', (req, res) => {
    res.send('welcome to Wild Live server')
});
app.listen(port, () => {
    console.log(`server running on port ${port}`);
})