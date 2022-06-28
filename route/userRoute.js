var express =  require("express");
const router = express.Router();
var userController = require("../controller/userController")

router.post('/login',userController.login);
router.post('/register',userController.register);

router.get('/login',(req,res)=>{
    res.end("login");
});
module.exports =  router ;