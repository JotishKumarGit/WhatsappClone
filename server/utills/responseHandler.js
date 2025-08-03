
const response = (res,statusCode, message,data=null)=>{
if(!res){
    console.error("Request object is null");
    return ;
}
const responseObject = {
   status: statusCode<400 ? "success" : "error",message,data
}
return res.status(statusCode).json(responseObject);

}

export default response;



