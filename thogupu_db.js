var mongoose = require('mongoose'),  
//  mongoURI = 'mongodb://thogupuadmin:thogupuaug1221@143.110.247.14/thogupu';
mongoURI = 'mongodb://localhost:27017/thoguppu';
//  mongoURI = 'mongodb://192.168.5.4:27017/thogupu';
// mongoURI = 'mongodb://inakkamadmin:inakkamjul0821@localhost/inakkam';
module.exports = connectionOne = mongoose.createConnection(mongoURI);

connectionOne.on('connected', function() {  
   console.log('Mongoose connected to Thoguppu db');
});