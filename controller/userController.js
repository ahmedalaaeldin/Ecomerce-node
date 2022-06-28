var queries = require('../db/queries');
var dbConnection = require('../db/Connection');
var validationUtil = require('../util/validations');
var jwtUtil = require('../util/jwtUtil');

var bcrypt = require('bcryptjs');


exports.login =  async(req,res)=>{
  try {
     const {username , password } = req.body;
  
     
   //  /** 
   //   *  1- validate is not empty
   //   *  2- get user by username
   //   *  3- Compare password
   //   *  4- get user roles  
   //   *  5- generate token
   //   */
    
     if(!username || !password ){
        return res.status(500).send({ message: 'username , password are required , should not empty' })
     }
       //query if user  exists or not
     var loginQuery = queries.queryList.LOGIN_QUERY;
     var result = await dbConnection.dbQuery(loginQuery , [username]);
     var dbResponse = result.rows[0];
     if(dbResponse == null){
        return res.status(500).send({ message: 'Invalid username or password , you should register or refer to admin' });
     }
     //check password
     var isPasswordValid = validationUtil.comparePassword(password , dbResponse.password);
     if(!isPasswordValid){
        return res.status(500).send({ message: 'password not matched' });
     }
     var token = dbResponse.token;
     console.log("token::"+token)
     //if token return null
     if(dbResponse.token == null){
        // Create token
        token = jwtUtil.generateToken(dbResponse.email,dbResponse.user_id,  [dbResponse.isadmin]  );
        // update token in database
        var values =[ token,dbResponse.user_id ];
        await updateTokenfun(values);
        console.log("token created becauase not in db");
     }
     

  
   
      // verify token
      const verified_token = await jwtUtil.verifyToken( [dbResponse.isadmin] ,token)
      console.log("checking token");
      if(verified_token.message != "valid token"){
        console.log("token invald");
        // Create token
        token = jwtUtil.generateToken(dbResponse.email,dbResponse.user_id, [dbResponse.isadmin] );
       
        // update token in database
        values = [ token,dbResponse.user_id ];
        await updateTokenfun(values);
        console.log("token created becauase token invald");
      }
    

  
   //success
   return res.status(200).send({ username: username , token:token});
} catch (err) {
    //fail
   console.log(err)
    return res.status(500).send({message : 'Failed to SignIn , Invalid username or password'});
  
}



}
exports.register = async (req,res)=>{
      // Our register logic starts here
      try {
        var created_at = new Date();
       
         // req.body
        var {username, email, password ,isAdmin} = req.body;
     
           // Validate user input
        if (!(email && password && username)) {
           res.status(400).send({message:"All input is required (email,password,username)"});
        }
        var registerUserQuery = queries.queryList.IS_USER_EXISTS_QUERY;
        var result = await dbConnection.dbQuery(registerUserQuery , [username,email]);
        //console.log("Result : " +  JSON.stringify(result))
        if(result.rowCount > 0){
            if (result.rows[0].count != "0") {
                  return res.status(500).send({ message: 'User already Exists' })
            }
        }
        
        if(!validationUtil.isValidEmail(email)){
            return res.status(500).send({ message: 'Email is not valid' })
        }

        if(!validationUtil.isValidPassword(password)){
            return res.status(500).send({ message: 'Password is not valid' })
        }
    
         //Encrypt user password
          encryptedPassword = await bcrypt.hash(password, 10);
         // Create token
         // var token = jwtUtil.generateToken(email, "user" );
         if(!isAdmin){
            isAdmin = "user";
         }

         const values =[username , encryptedPassword , email , "",created_at ,isAdmin];
         //query inser new user
         var registerUserQuery = queries.queryList.REGISTER_USER_QUERY;
         await dbConnection.dbQuery(registerUserQuery , values);
         //success
         return res.status(200).send({message:"Successfully registered "});
      }catch (err) {
        //fail 
        console.log(err);
        return res.status(500).send({message : 'Failed to regitser user'});
      }
    
}
//function update token in db
const updateTokenfun = async(values)=>{
  var updateTokenUserQuery = queries.queryList.UPDATE_TOKEN_QUERY;
  await dbConnection.dbQuery(updateTokenUserQuery , values);
  console.log("token updated");
}

  