var jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

exports.generateToken = (user_email,user_id ,userRoles )=>{
    var token = jwt.sign({
        // userId:userId,
        user_email:user_email,
        user_id:user_id,
        roles:userRoles
    } , process.env.TOKEN_KEY , {expiresIn :"60m"})
    return token;
}

exports.verifyToken = async (roles,token) => {
  
        try {
            
            console.log("token : " + token)
            if(!token){
                console.log("No token exist");
                return {message:"No token exist"};
                //return res.status(500).send({error : 'Token is not exist'})
            }
            // should validate if loggedIn user has the same role
            var decode =  jwt.verify(token , process.env.TOKEN_KEY);
           
            console.log("decode:"  + JSON.stringify(decode))
            console.log("decode:"  + decode.roles)
            user = {
                user_email:decode.user_email,
                user_id:decode.user_id,
                roles:decode.roles,
            }
            console.log("roles : " + roles);
           
            if(!this.hasRole(roles , decode.roles)){
                // console.log("Error : not have the same role");
                // return res.status(401).send({error : 'Authentication failed'})
                console.log("not have the same role");
                return {message:"not have permission for this action ."}; 
            }
            console.log("valid token");
            return {message:"valid token",user_id:decode.user_id}; 
        } catch (error) {
          
            return {message:"invalid token"}; 
        }
            
    
}

exports.hasRole = function(routeRoles , userRoles){
    console.log("routeRoles : " + routeRoles) 
    let result= false;
    userRoles.forEach(role => {
        if(routeRoles.includes(role)){
            result = true;
            return;
        }
    });
    console.log("result : " + result);
    return result;
}