
var express =  require("express");
const session = require("express-session");
var cors =require("cors");
const path = require('path');
var userRoute = require("./route/userRoute");
var productRoute = require("./route/productRoute");
var orderRoute = require("./route/orderRoute");
const dotenv = require('dotenv');
dotenv.config();

var app = express();


//session 
app.use(session({
    name: "session-id",
    secret: "GFGEnter", // Secret key,
    saveUninitialized: false,
    resave: false,
}))
//middleware
app.use(cors());
// parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// parse application/json
app.use(express.json());


//Welcome route
app.get("/", (req,res) => {
    res.status(200).send({message: "Welcome to Ecomerce"});
}); 
//routes
app.use("/api/v1",userRoute);
app.use("/api/v1",productRoute);
app.use("/api/v1",orderRoute);



const port = process.env.PORT || 5000;

app.listen(port,()=>{
    console.log("server start...");
})

module.exports = app ;