var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var cors = require('cors');
var session = require('express-session');

var thogupu = require('./routes/app');
var enthiran = require('./routes/enthiran');
var vav = require('./routes/vav');
var poc = require('./routes/poc');
var wdc = require('./routes/wdc');
var wsc = require('./routes/wsc');
var wsps = require('./routes/wsps');
var ats = require('./routes/ats');
var tfc = require('./routes/tfc');
var ups = require('./routes/ups');
var proposal = require('./routes/proposal');

var port = process.env.PORT || 3006;

var app = express();
app.use(cors());

//set Static Folder;
app.use('/catalogue', express.static(path.join(__dirname, '/public/catalogue')));
app.use('/toollogo', express.static(path.join(__dirname, '/public/toollogo')));
app.use('/orglogo', express.static(path.join(__dirname, '/public/orglogo')));
app.use('/profile', express.static(path.join(__dirname, '/public/profile')));
app.use('/thogupumail', express.static(path.join(__dirname, '/public/thogupumail')));
app.use('/drawings', express.static(path.join(__dirname, '/public/drawings')));
app.use('/checkpoints', express.static(path.join(__dirname, '/public/checkpoints')));
app.use('/notes', express.static(path.join(__dirname, '/public/notes')));
app.use('/help', express.static(path.join(__dirname, '/public/help')));


// body parser mw
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use('/', thoguppu);
app.use('/', enthiran);
app.use('/', vav);
app.use('/', poc);
app.use('/', wdc);
app.use('/', wsc);
app.use('/', wsps);
app.use('/', ats);
app.use('/', tfc);
app.use('/', ups);
app.use('/',proposal);

app.listen(port, function(){
    console.log('Server started on port '+port);
})