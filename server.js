//PACOTES
const compression = require("compression");
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const morgan = require("morgan");
const cors = require("cors");

//START APP
const app = express();

//AMBIENTE 
const isProduction = process.env.NODE_ENV === "production";
const PORT = process.env.PORT || 3000;

//ARQUIVOS ESTATICOS
app.use("/public", express.static(__dirname + "/public"));
app.use("/public/images", express.static(__dirname + "/public/images"));

//DATABASE
const dbs = require("./config/database");
const dbURI = isProduction ? dbs.dbProduction : dbs.dbTeste;
mongoose.set('useCreateIndex', true);
mongoose.connect(dbURI,{ useNewUrlParser: true });

//SETUP EJS

app.set("view engine","ejs");


//configuracoes
app.use(express.urlencoded({ extended: false,limit:1.5*1024*1024 }))
if(!isProduction) app.use(morgan("dev"));
app.use(cors());
app.disable('x-powered-by');
app.use(compression());

//SETUP BODY-parser

//app.use(bodyParser.urlencoded({extends:false,limit: 1.5*1024*1024})); // limit cache
app.use(bodyParser.json({limit: 1.5*1024*1024}));

// MODELS
require("./models");

//ROTAS
app.use("/", require("./routes"));

// 404 NOT FOUND
app.use((req,res,next)=>{
    const erro = new Error("error");
    erro.status = 404;
    next(erro);

});

// 401,422,500 NOT FOUND
app.use((err, req, res, next) => {
    res.status(err.status || 500);
    if(err.status !== 404) console.warn("Error: ", err.message, new Date());
    res.json(err);
});

//LISTEN

app.listen(PORT,(err)=>{
if(err) throw err;
console.log(`Rodando na porta //localhost:${PORT}`);
});
