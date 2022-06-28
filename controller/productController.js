
var queries = require('../db/queries');
var dbConnection = require('../db/Connection');
var jwtUtil = require('../util/jwtUtil');
var bcrypt = require('bcryptjs');


exports.addProduct = async (req,res)=>{
  try{
       //check token
       var token = req.session.token || req.body.token  ;
       if(!token){
        return res.status(500).send({message:"you must login first OR send token ."});
       }
       //check permission 
       const verified_token = await jwtUtil.verifyToken(["user"],token)
       console.log("checking token");
       if(verified_token.message != "valid token"){
          return res.status(500).send({message:verified_token.message+", refer to admin"});
       }
       var created_at = new Date();
       // req.body
       const {product_name, product_details,product_price} = req.body;
       // Validate user input
       if (!(product_name && product_details && product_price)) {
        return  res.status(400).send({message:"All input is required (product_name,product_details,product_price)"});
       }
       if(isNaN(product_price)){
        return  res.status(400).send({message:"product_price should be number"});
       }
       //Encrypt product
       var product_code = await bcrypt.hash(product_name, 8);
       const values =[product_name , product_details , product_code , product_price ,created_at ];
      //add new product
       var addProductQuery = queries.queryList.SAVE_PRODUCT_QUERY;
       await dbConnection.dbQuery(addProductQuery , values);
       //success
       return res.status(200).send({message:"Successfully added product",productCode:product_code});

  } catch (err){
       //fail
       console.log(err)
       return   res.status(500).send({message:"failed to add product"}) ;
  }

 
}

