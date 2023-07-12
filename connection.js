const mysql = require('mysql');
const { connect } = require('.');
require('dotenv').config();

var connection = mysql.createConnection({
    port:process.env.DS_PORT,
    host:process.env.DS_HOST,
    user:process.env.DS_USERNAME,
    password:process.env.DS_PASSWORD,
    database:process.env.DB_NAME
})

connection.connect((err)=>{
    if(!err){
        console.log("Connected");
    }
    else{
        console.log(err);
    }
});

module.exports = connection;