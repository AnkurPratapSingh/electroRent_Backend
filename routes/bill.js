const express = require('express');
const connection = require('../connection')

const router =  express.Router();
let ejs = require('ejs')
let pdf = require('html-pdf');
let path = require('path');
var fs = require('fs');
var uuid = require('uuid');
const auth = require("../services/authentication");
const { log } = require('console');


router.post('/generateReport', auth.authenticationToken,(req,res)=>{
    const generateUuid = uuid.v1();
    const orderDetails = req.body;
    var productDetailsReport = JSON.parse(orderDetails.productDetails);
   var query = "insert into bill (name ,uuid,email,contactNumber,paymentMethod,total,productDetails,createdBy) values (?,?,?,?,?,?,?,?)" ;
   connection.query(query,[orderDetails.name,generateUuid,orderDetails.email,orderDetails.contactNumber,orderDetails.paymentMethod,orderDetails.totalAmount,orderDetails.productDetails,res.locals.email],(err,result)=>{
    if(!err){
        ejs.renderFile(path.join(__dirname,"report.ejs"),{productDetails:productDetailsReport,name:orderDetails.name,email:orderDetails.email,contactNumber:orderDetails.contactNumber,paymentMethod:orderDetails.paymentMethod,totalAmount:orderDetails.totalAmount},(err,result)=>{
                    
            if(err){
                console.log("Hi this is render");
                return res.status(500).json(err);

            }
            else{

                pdf.create(result, {
                    childProcessOptions: {
                      env: {
                        OPENSSL_CONF: '/dev/null',
                      },
                    }
                  } ).toFile('./generated_pdf/'+generateUuid+".pdf",function(err,data){
                    if(err){
                    console.log(err);
                    return res.status(500).json(err);
                       }
                    else{
                        return res.status(200).json({uuid:generateUuid})
                    }
                })
            }
        })
    }
    else{
        console.log("Hi");
        return res.status(500).json(err);

    }
   });
})

router.get('/getPdf',auth.authenticationToken,(req,res)=>{
    const orderDetails = req.body;
    const pdfPath = './generated_pdf/'+orderDetails.uuid+'.pdf';
    if(fs.existsSync(pdfPath)){
        res.contentType('application/pdf');
        fs.createReadStream(pdfPath).pipe(res);
    }
    else{
        var productDetailsReport=JSON.parse(orderDetails.productDetails);
        ejs.renderFile(path.join(__dirname,"report.ejs"),{productDetails:productDetailsReport,name:orderDetails.name,email:orderDetails.email,contactNumber:orderDetails.contactNumber,paymentMethod:orderDetails.paymentMethod,totalAmount:orderDetails.totalAmount},(err,result)=>{
                    
            if(err){
                console.log("Hi this is render");
                return res.status(500).json(err);

            }
            else{

                pdf.create(result, {
                    childProcessOptions: {
                      env: {
                        OPENSSL_CONF: '/dev/null',
                      },
                    }
                  } ).toFile('./generated_pdf/'+orderDetails.uuid+".pdf",function(err,data){
                    if(err){
                    console.log(err);
                    return res.status(500).json(err);
                       }
                    else{
                        res.contentType('application/pdf');
                        fs.createReadStream(pdfPath).pipe(res);                    }
                })
            }
        })
        
    }
})
router.get('/getBills',auth.authenticationToken,(req,res,next)=>{
     var query ="select * from bill order by id desc";
     connection.query(query,(err,result)=>{
        if(!err){
            return res.status(200).json(result);

        }
        else{
            return res.status(500).json(err);

        }
     })
})
router.delete('/delete/:billId',auth.authenticationToken,(req,res ,next)=>{
    const billId = req.params.billId;
      var query ="delete from bill where id=?";
      connection.query(query,[billId],(err,result)=>{
        if(!err){
            if(result.affectedRows==0)
            return res.status(404).json({message:"Bill can not be generated"});
            else{
                return res.status(200).json({message:"Success! Record has been deleted"})
            }

        }
        else{
            return res.status(500).json(err);

        }
     })

})
module.exports = router;


