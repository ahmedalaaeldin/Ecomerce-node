var queries = require('../db/queries');
var dbConnection = require('../db/Connection');
var jwtUtil = require('../util/jwtUtil');





exports.addProductInOrder =  async(req,res)=>{
  try{
    //check token
    var token = req.session.token || req.body.token  ;
    if(!token){
     return res.status(500).send({message:"you must login first OR should send token ."});
    }
    //check permission 
    const verified_token = await jwtUtil.verifyToken(["user"],token)
    console.log("checking token");
    if(verified_token.message != "valid token"){
       return res.status(500).send({message:verified_token.message+", refer to admin"});
    }
    var created_at = new Date();
    var order_id = null ;
  
    // req.body
    const {product_id} = req.body;
    if(!product_id){
      return res.status(500).send({message:" should send product id ."});
    }
    //query to get order still not submit
    var GET_ORDERS_NOT_SUBMITEDQuery = queries.queryList.GET_ORDERS_NOT_SUBMITED;
    console.log("userID:"+verified_token.user_id);
    //result query 
    var result = await dbConnection.dbQuery(GET_ORDERS_NOT_SUBMITEDQuery , [verified_token.user_id]);
    var dbResponse = result.rows[0];
    order_id = "";
     //if no order still  open   
    if(dbResponse == null){
      //query to insert order new
      var SET_INTIAL_ORDERQuery = queries.queryList.SET_INTIAL_ORDER;
      await dbConnection.dbQuery(SET_INTIAL_ORDERQuery , [verified_token.user_id,created_at]);

      //query to get order id for order new
      var result = await dbConnection.dbQuery(GET_ORDERS_NOT_SUBMITEDQuery , [verified_token.user_id]);
      dbResponse = result.rows[0];
      order_id = dbResponse.order_id;

    }else{
       //if order still open get order id
      order_id = dbResponse.order_id;
    }
    var SET_PRODUCT_IN_ORDERQuery = queries.queryList.SET_PRODUCT_IN_ORDER;
    await dbConnection.dbQuery(SET_PRODUCT_IN_ORDERQuery , [order_id,product_id,created_at]);

    //success
    return   res.status(500).send({message:"successfully add product in order",orderId:order_id}) ;
 


  } catch (err){
     //fail
      console.log(err)
      return   res.status(500).send({message:"failed to add product in order"}) ;
  }

  //res.json({"message": JSON.stringify(["ASA","SAS"])}) 
}
  exports.submitOrder = async (req,res)=>{
    try{
      //check token
      var token = req.session.token || req.body.token  ;
      if(!token){
       return res.status(500).send({message:"you must login first OR should send token ."});
      }
      //check permission 
      const verified_token = await jwtUtil.verifyToken(["user"],token)
      console.log("checking token");
      if(verified_token.message != "valid token"){
         return res.status(500).send({message:verified_token.message+", refer to admin"});
      }
      // req.body
      const {order_id,address,distance} = req.body;
      if(!(order_id && address && distance)){
        return res.status(500).send({message:"should send (order_id and address and distance ) ."});
      }
      //get all products for order id
      var GET_PRODUCTS_ORDERQuery = queries.queryList.GET_ALL_PRODUCTS_ORDER;
      var result =   await dbConnection.dbQuery(GET_PRODUCTS_ORDERQuery , [order_id]);
      dbResponse = result.rows[0];
      if(dbResponse == null){
        return   res.status(500).send({error:"please sure from order"}) ; 
      }
      //calculate price all products
      var order_total_price = 0;
      result.rows.forEach(price => {
            price= Number( price.product_price);
            order_total_price +=price ;
            return;
        
      });
      //get number all products
      var order_product_count = result.rowCount;
      console.log(order_total_price + ":::"+order_product_count);
      //calculate delivery_fees 
      var delivery_fees = 20 ;
      if(distance > 10){
        delivery_fees = 30 ;
      }
      //submit order change order status to "new" and ORDER_SUBMIT to "1"
      var SET_NEW_ORDERQuery = queries.queryList.SET_NEW_ORDER;
      await dbConnection.dbQuery(SET_NEW_ORDERQuery , [order_total_price,order_product_count,address,distance,order_id,delivery_fees]);
      //success
      return   res.status(500).send({error:"successfully submit order"}) ;
    } catch (err){
      //fail
        console.log(err);
        return   res.status(500).send({error:"failed to submit order"}) ;
    }
  
  
  }
  exports.showOrdersUsers =  async(req,res)=>{
    try{
      //check token
      var token = req.session.token || req.body.token  ;
      if(!token){
       return res.status(500).send({message:"you must login first OR should send token ."});
      }
      //check permission 
      const verified_token = await jwtUtil.verifyToken(["admin"],token)
      console.log("checking token");
      if(verified_token.message != "valid token"){
         return res.status(500).send({message:verified_token.message+", refer to admin"});
      }
      //req.body
      const {page_no,order_count,order_status,order_id} = req.body;
      
      //build query to search orders
      var limit =``;
      var page_no_cal = 0 ;
      //pages
      if(!page_no || page_no == 0){
        console.log("page is null");
        limit =  `OFFSET 0`;
      }else{
        console.log("page is not null");
        //count orders in every one page
        if(order_count || order_count != 0){
          page_no_cal =  page_no;
          if(page_no_cal  > 0){
            page_no_cal = ((page_no_cal - 1) * order_count)-1;
          }
          limit =  `LIMIT `+order_count+` OFFSET `+page_no_cal;
        }
      }
      
      var  where =``;
      //check orders status
      if(order_status){
         where += `and orders.order_status = '`+order_status+`'`;
      }
      //check order unique
      if(order_id){
        where += `and orders.order_id = '`+order_id+`'`;
      }
    
     var GET_orders_DETAIL_QUERY =  `SELECT users.username,orders.order_address,orders.order_distance,orders.products_total
     ,orders.order_price_total,orders.order_status,orders.delivery_fees
     FROM ecomerce.orders inner join ecomerce.users on orders.user_id = users.user_id
     where orders.order_status != '' `+where+`
     ORDER BY order_id ASC  
     `+ limit;
     var result = await dbConnection.dbQuery(GET_orders_DETAIL_QUERY );
     console.log(JSON.stringify(  result.rows))
     //success
     return   res.status(200).send({message:"success",rows:JSON.stringify(  result.rows )}) ;
    } catch (err){
       //fail
        console.log(err)
        return   res.status(500).send({error:"failed to get all orders"}) ;
    }
  
   
  }
  