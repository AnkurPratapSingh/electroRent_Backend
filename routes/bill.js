const express = require('express');
const connection = require('../connection')

const router =  express.Router();
let ejs = require('ejs')
let pdf = require('html-pdf');
let path = require('path');
var fs = require('fs');
var uuid = require('uuid');
const auth = require("../services/authentication")


router.post('/generateReport', auth.authenticationToken,(req,res)=>{
    const generateUuid = uuid.v1();
    const orderDetails = req.body;
    var productDetailsReport = JSON.parse(orderDetails.productDeatils);
   //gi var query = "insert into bill (name ,uuid," 
})