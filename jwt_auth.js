const secret_key = 'ThogupuTool@1232456';
var jwt = require('jsonwebtoken');
var jwtAuth=function(req, res, next) {
   
    let token = req.headers["authorization"];
    if (!token) {
      return res.status(403).send({ auth: false, message: 'No token provided' });
    }
    
    token = token.replace(/^Sk2827\s+/, "");
    jwt.verify(token, secret_key, function(err, decoded) {
        if (err) {
            return res.status(500).send({ auth: false, message: 'Could not authenticate token' });
        }
        else
        {
            req.userName = decoded.uname;
            req.userId = decoded.uid;
            req.userEmail = decoded.uemail;
            req.userOrg = decoded.uorg;
            next();
        }
    });
};

module.exports = jwtAuth