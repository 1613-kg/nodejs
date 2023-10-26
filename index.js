import express from "express";
import path from "path";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const app = express();


const isAuth = async(req,res,next)=> {
    const {token} = req.cookies;

    if(token){
        const decoded = jwt.verify(token,"fdsfdsfsd");
        req.user = await User.findById(decoded._id);
        next();
    }
    else res.render("login");
}

mongoose.connect("mongodb://127.0.0.1:27017",{
    dbName:"firstTest",
}).then(()=>{
    console.log("Database Connected");
}).catch((e)=>console.log(e));

app.use(express.static(path.join(path.resolve(),"public")));
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());


app.set("view engine","ejs");

const userSchema = new mongoose.Schema({
    name:String,email:String,password:String,
});

const User = mongoose.model("users",userSchema);

//post methods

app.post("/register",async(req,res)=>{
const { name, email, password } = req.body;
   let user = await User.findOne({email});
   
   if(user)return res.redirect("/login");
   const hashedPass = await bcrypt.hash(password,10);
   user =  await User.create({name:name,email:email,password:hashedPass});
   const token = jwt.sign({_id:user._id},"fdsfdsfsd");
    res.cookie("token",token);
    res.redirect("/");
})


app.post("/login",async(req,res)=>{
    const { name, email, password } = req.body;
       let user = await User.findOne({email});
       
       if(!user)return res.redirect("/register");
       
       const isMatch = await bcrypt.compare(password, user.password);
       
       

  if (!isMatch)return res.render("login", { email, message: "Incorrect Password" });
    

       const token = jwt.sign({_id:user._id},"fdsfdsfsd");
        res.cookie("token",token);
        res.redirect("/");
    })


 //get methods

app.get("/",isAuth,(req,res)=>{
    res.render("logout",{name:req.user.name});    
 }); 


 app.get("/register",(req,res)=>{
    res.render("register");
 })
 app.get("/login",(req,res)=>{
     res.render("login");
 })

 

app.get("/logout",(req,res)=>{
    res.cookie("token",null,{
      expires : new Date(Date.now())
    });
    res.redirect("/");
})

app.listen(5000,()=>{
    console.log("Server is working");
});