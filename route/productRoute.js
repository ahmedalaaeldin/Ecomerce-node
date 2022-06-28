var express =  require("express");
const router = express.Router();
var productController = require("../controller/productController");

router.post('/addProduct',productController.addProduct);



module.exports =  router ;