const express = require('express');
const connection = require('../connection');
const router = express.Router();

const nodeMailer = require('nodemailer')
const jwt = require('jsonwebtoken');
require('dotenv').config();
var auth = require('../services/authentication');
var checkRole = require('../services/checkRole')


router.post('/signup',(req,res)=>{
    let user = req.body;
    query = "select email,password,role,status from user where email=?"
    connection.query(query,[user.email],(err,result)=>{
        if(!err){
            
            if(result.length<=0)
            {
              query =  "insert into user(name,contactNumber,email,password,status,role) values (?,?,?,?,'false','user');"
              connection.query(query,[user.name,user.contactNumber,user.email,user.password],(err,result)=>{
                if(!err){
                    return res.status(200).json({message:"Successfully Registered"});
                }
                else{
                    return res.status(500).json(err);

                }
              })
            }
            else{
                return res.status(500).json({message:"Email Already Present"});

            }
        }
        else{
            return res.status(500).json(err);
        }
    })
})


router.post('/login',(req,res)=>{
    const user = req.body;
    query = "select email,password,role,status from user where email=?"
    connection.query(query,[user.email],(err,result)=>{
        console.log(result)
        if(!err){
            if(result.length<=0 || result[0].password!=user.password)
            {
                return res.status(500).json({message:"Username or Passsword is incorrect"});
            }
            else if(result[0].status=='false'){
                return res.status(401).json({message:"Waiting for admin approval"});

            }
            else if(result[0].password==user.password){
                 
                const response = {email:result[0].email, role:result[0].role}
                const accessToken = jwt.sign(response,process.env.ACCESS_TOKEN,{expiresIn:'1h'})
                res.status(200).json({token:accessToken})
            }
            else{
                return res.status(500).json({message:"Something went wrong try again"});
            }
        }
        else{
            return res.status(500).json(err);

        }
})})


var transporter = nodeMailer.createTransport({
    service:'gmail',
    auth:{
        user:process.env.EMAIL,
        pass:process.env.PASSWORD

    }
})

        router.post('/forgotPassword',(req,res)=>{
            console.log(process.env.EMAIL );
            const user = req.body;
            query = "select email,password,role,status from user where email=?"
            connection.query(query,[user.email],(err,result)=>{
                if(!err)
                {
                   if(result.length<=0)
                   {
                    return res.status(200).json({message:"Password sent to your email succesfully"}) // if no user exist as hacker cannot know whther the email is present or not
                   }
                   else{
                    var mailOptions = {
                        from:process.env.EMAIL,
                        to:result[0].email,
                        subject:'Password by Electro_rent',
                        html:'<p><b>Your login details </b><br><b> Email:</b>'+result[0].email+'<br><b>Password: </b>'+result[0].password+'<br><a href="">Click to login</a></p>'
                    }; // href local host later add on 
                    transporter.sendMail(mailOptions,function(error,info){
                        if(error){
                            console.log(error);
                        }
                        else{
                            console.log('Email sent : ' +info.response)
                        }
                    });
                    return res.status(200).json({message:"Password sent to your email succesfully"})

                   }
                }
                else{
                    return res.status(500).json(err);
                }
        })})

    router.get('/get',auth.authenticationToken,checkRole.checkRole,(req,res)=>{
       // const user = req.body;
        query = "select email,password,role,status from user where role='user';"
        connection.query(query,(err,result)=>{

            if(!err){
               return res.status(200).json(result);
            }
            else{
                return res.status(500).json(err);
            }
        })


    })

    router.patch('/update',auth.authenticationToken,checkRole.checkRole,(req,res)=>{
        let user = req.body;
        var query = "update user set status=? where id=?";
        connection.query(query,[user.status,user.id],(err,result)=>{
            if(!err){
                 if(result.affectedRows==0){
                    return res.status(404).json({message:"user id does not exist"});
                 }
                 return res.status(200).json({message:"User updated successfully"});
            }
            else{
                return res.status(500).json(err);
            }
        })
    })


    router.get('/checkToken',(req,res)=>{
        return res.status(200).json({message:"true"})
    })


    router.post('/changePassword',auth.authenticationToken,(req,res)=>{
       
        const user = req.body;
        const email = res.locals.email;
        var query = "select * from user where email = ? and password=?";
        connection.query(query,[email,user.oldPassword],(err,result)=>{
            if(!err){
                if(result.length<=0){
                    return res.status(400).json({message:"Incorect old password"});
                }
                else if(result[0].password==user.oldPassword){
                    query = "update user set password =? where email = ?";
                    connection.query(query,[user.newPassword,email],(err,result)=>{
                        if(!err){
                            return res.status(200).json({message:"Password Changed succesfully"})
                        }
                        else{
                            return res.status(500).json(err);
                        } 
                    })
                }
                else{
                    return res.status(400).json({message:"Something went wrong"});
                }
            }
            else{
                return res.status(500).json(err);
            }
        })
    })
module.exports = router;