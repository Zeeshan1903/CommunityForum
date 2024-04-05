const express = require('express');
const fs = require('fs');
const app = express();
const path = require('path');
const bcrypt = require('bcrypt');
const { MongoClient } = require('mongodb');

const uri= 'mongodb://localhost:27017';
const client = new MongoClient(uri);

const {Server } = require('socket.io');
const { json } = require('body-parser');


app.use(express.urlencoded({ extended: true }));

const port = 8100;

var data = {}
async function connectToDb() {
    const connect = await client.connect();
    console.log('Connected to Database');
}
connectToDb();

app.get('/', (req, res) => {

    const indexHtml = path.join(__dirname, 'index.html');
    res.sendFile(indexHtml);

})


async function hashpassword(safe) {
    const saltRound = 10;
    const hashedPass = await bcrypt.hash(safe, saltRound);
    return hashedPass;
}

async function verifyPassword(safe,hashedPasswordWithSalt){
    const match = await bcrypt.compare(safe,hashedPasswordWithSalt);
    return match;
}
var obj = {
    
}
var db = client.db('ChatBot');
var collection = db.collection('users');
collection.insertOne({active_user:'active_user'})
app.post('/home',async (req, res) => {
   
        //Hashing of the password by calling the hashpassword funciotn 
        var hashed_password = await hashpassword(req.body.password);
        console.log(hashed_password);

        //Makin the obj variable which will store all the data of the current user
        obj = {
            'name': req.body.name,
            'handle_name': req.body.handle_name,
            'email': req.body.email,
            'password': hashed_password
        }

        collection.updateOne({active_user:'active_user'},{$set:{active_user_no:1}})

        //Checking if the user is present or not 
        const existingUser = await collection.findOne({ email: req.body.email });  
        console.log(existingUser)
        console.log(existingUser);


        const homeHtml = path.join(__dirname, 'chatBot_index.html');


        if (existingUser) {
            const password = await verifyPassword(req.body.password,existingUser.password);
            console.log('User with email already exists:', req.body.email);

            console.log('User dont added ');

            if(password){
                const indexHtml = path.join(__dirname, 'index.html');
                return res.sendFile(indexHtml);
            }
            else{
                return res.send('Wrong password entered retry again');
            }
        }

        //This is the addition of the current user into the list of the active user list 
        collection.updateOne({active_user:'active_user'},{$push:{current_user_list:{$each:[obj.name]}}})


        let result =await collection.insertOne(obj);
        let user_collection = db.collection(req.body.handle_name);
        let insert = user_collection.insertOne({'name':req.body.name});
        console.log('User added to the database ');


        
        data = {
            'name':req.body.name
        }
        res.sendFile(homeHtml)
        
})

// app.get('/',(req,res)=>{
//     const chatBot_index = path.join(__dirname,'chatBot_index.html')
//     res.sendFile(chatBot_index)
// })

app.get('/getUserDetail',(req,res)=>{
    res.send(JSON.stringify(data))
})
app.get('/chatBot_client.js',(req,res)=>{
    console.log('Here it ask for the client file of the chatbot system ')
    const client = path.join(__dirname,'chatBot_client.js')
    res.sendFile(client)
})

const server = app.listen(port,()=>{
    console.log('Server is running on the port no '+port)
})


const io = new Server(server)
io.on('connection',async(socket)=>{
    console.log('A user connected')
    await collection.updateOne({active_user:'active_user'},{$inc:{active_user_no:1}})
    var a = await collection.findOne({active_user:'active_user'})
    console.log('*************************************',a.current_user_list)
    socket.on('message_client',(msg)=>{
        var address = socket.handshake.address;
        if(msg == 'Hi'){


            console.log('Message emiited &&&&&&&&&&&&&&&&&&&&&&')
            //io.sockets.emit will send the message to all the users including the connected user
            //socket.broadcast.emit will send the message to all teh users except the connected user
            socket.broadcast.emit('message_server','Server: How are you ')
        }
        else if(msg == 'Good Morning'){
            //It will send the message to the connected user only
            socket.emit('message_server',`Server: Hi ${data.name} Good Morning`)
        }
        else if(msg == 'Hi how'){
          
            io.emit('message_server',`Server: Vishesh is the not the only person and here is the connected lsit  ${a.current_user_list}`)
        }

        else{
            console.log('Message emiited &&&&&&&&&&&&&&&&&&&&&&')
            io.emit('message_server',`Server: Hi ${data.name}`)
        }
        console.log('Message form client : '+ address + ' is :  '+msg)
    });
    
    socket.on('disconnect',async ()=>{
        await collection.updateOne({active_user:'active_user'},{$inc:{active_user_no:-1}})
        await collection.updateOne({active_user:'active_user'},{$pull:{current_user_list:obj.name}})
        console.log('Disconnected')
    });

});

app.get('/getActiveUser', async (req,res)=>{

    var count = await (collection.findOne({active_user:'active_user'}))
    console.log(count)
    count = count.active_user_no
    console.log(count)
    res.send(JSON.stringify(count))
})