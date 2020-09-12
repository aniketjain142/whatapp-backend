//importing
const express = require('express');
const mongoose=require('mongoose');
const messages=require('./dbmessages');
var Pusher = require('pusher');
const cors=require('cors');

//app config
const app = express();
const port= process.env.PORT||9000
var pusher = new Pusher({
    appId: '1071700',
    key: '10ecd6f77b0501399219',
    secret: '5cb9975483dfaf47bb2f',
    cluster: 'ap2',
    encrypted: true
  });



//middleware
app.use(express.json());
app.use(cors());
// app.use((re,res,next)=>{
//     res.setHeader('Access-Control-Allow-Origin','*');
//     res.setHeader('Access-Control-Allow-Hearders','*');
//     next();
// })



//db config
const connection_url='mongodb+srv://admin:Killing!!1@cluster0.we1nb.mongodb.net/whatsappdb?retryWrites=true&w=majority'
mongoose.connect(connection_url,{
    useCreateIndex:true,
    useNewUrlParser:true,
    useUnifiedTopology:true
})


const db=mongoose.connection;
db.once('open',()=>{
    console.log("Db is connected");
    const msgCollection=db.collection('messagecontents');
    const changeStream=msgCollection.watch();
    changeStream.on('change',(change)=>{
        console.log(change);
        if(change.operationType==='insert'){
            const messageDetails=change.fullDocument;
            pusher.trigger('messages','inserted',{
                name:messageDetails.name,
                message:messageDetails.message,
                timestamp:messageDetails.timestamp,
                received:messageDetails.received        
            });
        }
        else{
            console.log("Errorr in pusher");
        }
    })
})

//api routes
app.get('/',(re,res)=>res.status(200).send('hello world'));

app.get('/messages/sync',(re,res)=>{
    messages.find((err,data)=>{
        if(err){
            res.status(500).send(err);
        }
            else{
                res.status(200).send(data);
            }
    })
});

app.post('/messages/new',(re,res)=>{
    const dbMessage=re.body
    messages.create(dbMessage,(err,data)=>{
        if(err){
            res.status(500).send(err);
        }
            else{
                res.status(201).send(data);
            }
        
   
});
});
//listen
app.listen(port,()=>console.log(`listen on localhost ${port}`))