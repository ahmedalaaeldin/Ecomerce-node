var express =  require("express");
const router = express.Router();
var orderController = require("../controller/orderController");

router.post('/addProductOrder',orderController.addProductInOrder);
router.post('/submitOrder',orderController.submitOrder);
router.post('/admin/showOrders',orderController.showOrdersUsers);




module.exports =  router ;