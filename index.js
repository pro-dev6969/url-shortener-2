const express =  require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const bodyParser = require('body-parser');
const ShortUrl = require('./models/shortUrl')

const app = express()
app.set('view engine', 'ejs')

app.use(bodyParser.urlencoded({extended : true}));
app.use(session({secret: '1234' , resave:true , saveUninitialized: true}))
app.use(express.static(__dirname + '/public'));

//connect to mongoose

// mongoose.connect('mongodb://localhost:27017/login' , { useNewUrlParser: true, useUnifiedTopology: true })
const connectToMongo = async () => {
    await mongoose.connect('mongodb://0.0.0.0:27017/login');
    console.log("Connected to MongoDB");
  };
  
  connectToMongo();

//define user schema
const userSchema = new mongoose.Schema({
    username: String,
    password: String,
})

//create user model
const User = mongoose.model('User', userSchema);

app.get('/',(req,res)=>{
    
    res.render(__dirname+'/index.ejs');
    
})

app.post('/register' , (req,res) =>{
    res.render(__dirname+"/reg.ejs" , {content : "Register Now !"});
})

//registration route 
app.post('/registering' , (req,res)=>{

    const {username,password} = req.body;

    //create a new user in database
   
    const createNewUser = async () =>{
        const newUser = await User.create({username,password});
        console.log("user added succefully");
        res.render(__dirname+"/index.ejs" )
    }
    createNewUser();
})


app.post('/submit',(req,res)=>{
    
    const {username, password} = req.body;

    //check user credentials
    const findDB = async () =>{
        try{
            const data = await User.findOne({username,password});

            if(!data){
                res.render(__dirname+"/submit.ejs" , {content: "User Not Registered !"})
            }
            if(data){
                // res.render(__dirname+"/submit.ejs" , {content: "Logged in Successfully ! "})
                const URL = async (request,response)=>{
                    const shortUrls = await ShortUrl.find()
                    res.render('url', { shortUrls: shortUrls })
                }
                URL();
            }
        }catch(e){
            console.error(e);
        }
    }

    findDB();
})

app.post('/shortUrls', async (req, res) => {
    await ShortUrl.create({ full: req.body.fullUrl })
  
    res.redirect('url')
  })
  
  app.get('/:shortUrl', async (req, res) => {
    const shortUrl = await ShortUrl.findOne({ short: req.params.shortUrl })
    if (shortUrl == null) return res.sendStatus(404)
  
    shortUrl.clicks++
    shortUrl.save()
  
    res.redirect(shortUrl.full)
  })

app.listen(3000,()=>{
    console.log('listening on 3000');
})