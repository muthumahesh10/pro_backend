const express = require('express');
const speakEasy = require('speakeasy');
var router = express.Router();
var Thogupu = require('../models/thogupu_schema');
var Enthiran = require('../models/enthiran_schema');
var ATS = require('../models/ats_schema');
var VAV = require('../models/vav_schema');
var WSC = require('../models/wsc_schema');
var WDC = require('../models/wdc_schema');
var TFC = require('../models/tfc_schema');
var UPS = require('../models/ups_schema');
var PROPOSAL=require('../models/proposal_schema');

var jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
var ObjectId = require('mongodb').ObjectID;
const secret_key = 'ThogupuTool@1232456';
var bcrypt = require('bcrypt');
var salt = bcrypt.genSaltSync(10);
var Thogupukey = require('../emailkey/key.json');
var salt = bcrypt.genSaltSync(10);
var jwtAuth = require('./jwt_auth.js');

/* 
var jwtAuth = (req, res, next) => {
    let token = req.headers["authorization"];
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(403).send({ auth: false, message: 'No token provided' });
    }

    const decoded = jwt.verify(token, secret_key);

    req.userId = decoded.uid;
    req.userEmail = decoded.uemail;
    next()
}; 
 */
let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // secure:true for port 465, secure:false for port 587
    auth: {
        type: 'OAuth2',
        user: 'contact@jupiterbrothers.com',
        serviceClient: Thogupukey.client_id,
        privateKey: Thogupukey.private_key
    }
});

let sendSecretMailer = (clientEmail, secretCode) => {
    let mailOptions = {
        from: '"Jupiter Brothers" <contact@jupiterbrothers.com>', // sender address
        to: clientEmail, // list of receivers
        subject: 'Thougupu - Secret Code', // Subject line
        text: 'Authentication', // plain text body
        html: '<div><div style="width: 600px;"> <div style="text-align:center;padding-top: 10px;"> <img src="cid:thogupulogo@thogupu.com"> </div> <div style="padding-top: 20px;"> <div style="background-color: #FAFBFF;padding: 10px 20px 50px 20px;"> <div style="font-size: 30px;text-align: center;font-weight: bold;padding-top: 30px;font-family: Arial, Helvetica, sans-serif;">Quick Security Check</div> <div style="padding: 20px 0px 0px 30px;"><span style="font-weight: 400;font-size: 16px;font-family: Arial, Helvetica, sans-serif;">We take your account’s security seriously. Therefore, when you register</div> <div style="padding:2px 0px 0px 56px;"><span style="font-weight: 400;font-size: 16px;font-family: Arial, Helvetica, sans-serif;"></span> with us, we ask you to complete an additional verification step.</div> <div style="text-align: center;margin-top: 30px;"><img src="cid:security@thogupu.com"></div> <div style="padding: 40px 50px 0px 120px;text-align: center;"> <div style="background-color:rgba(206, 206, 206, 0.2);width: 280px; padding: 14px 0px;border-radius: 8px;color:  #000000;font-weight: 700;font-size: 26px;letter-spacing: 0.5em;">'+secretCode+'</div> <div style="font-size: 10px;clear: both;padding: 0px 115px 0px 0px;font-family: Arial, Helvetica, sans-serif;">Copy and paste this code in Thogupu app</div> </div> </div> <div style="text-align: center;padding-top: 15px;"> <img src="cid:jblogo@thogupu.com"> </div> <div style="font-size: 12px;text-align: center;padding-top: 10px;font-family: Arial, Helvetica, sans-serif;">If you have any questions, feel free to message us at info@jupiterbrothers.com</div> <div style="font-size: 12px;text-align: center;padding-top: 10px;font-weight: 700;font-family: Arial, Helvetica, sans-serif;">Maraneri, Sivakasi, Tamil Nadu, India</div> <div style="display: flex;text-align: center;padding: 10px 0px 0px 223px;"> <a href="https://www.linkedin.com/mwlite/company/jupiterbrothers" target="_blank" > <img src="cid:linkedin@thogupu.com"> </a> <a href="https://m.facebook.com/innovationforaec/?locale2=en_US"  target="_blank" style="padding-left: 14px;"> <img src="cid:facebook@thogupu.com"> </a><a href="https://instagram.com/jupiter.brothers?utm_medium=copy_link"  target="_blank" target="_blank" style="padding-left: 14px;"> <img src="cid:instagram@thogupu.com"> </a><a href="https://twitter.com/jupiterbrothers"  target="_blank" style="padding-left: 14px;"> <img src="cid:twitter@thogupu.com"> </a><a href="https://www.youtube.com/channel/UCn83bZm06GeV8r3OBjKYZ4Q/featured"  target="_blank" style="padding-left: 14px;"> <img src="cid:youtube@thogupu.com"> </a></div><div style="text-align: center;font-size: 12px;padding-top: 10px;font-family: Arial, Helvetica, sans-serif;">Terms of use | Privacy Policy</div><div style="padding-top: 10px;"><div style="background-color: #DB053D;color: white;font-size: 12px;text-align: center;padding: 5px 0px 5px 0px;">All rights reserved © Jupiter Brothers Data Center Pvt. Ltd.,</div></div></div></div></div>', // html body
        attachments: [{
            filename: 'thogupulogo.png',
            path: 'https://backend.thogupu.com/thogupumail/thogupulogo.png',
            cid: 'thogupulogo@thogupu.com' 
        },{
            filename: 'jblogo.png',
            path: 'https://backend.thogupu.com/thogupumail/jblogo.png',
            cid: 'jblogo@thogupu.com' 
        },{
            filename: 'facebook.png',
            path: 'https://backend.thogupu.com/thogupumail/facebook.png',
            cid: 'facebook@thogupu.com' 
        },{
            filename: 'instagram.png',
            path: 'https://backend.thogupu.com/thogupumail/instagram.png',
            cid: 'instagram@thogupu.com' 
        },{
            filename: 'linkedin.png',
            path: 'https://backend.thogupu.com/thogupumail/linkedin.png',
            cid: 'linkedin@thogupu.com' 
        },{
            filename: 'security.png',
            path: 'https://backend.thogupu.com/thogupumail/security.png',
            cid: 'security@thogupu.com' 
        },{
            filename: 'twitter.png',
            path: 'https://backend.thogupu.com/thogupumail/twitter.png',
            cid: 'twitter@thogupu.com' 
        },{
            filename: 'youtube.png',
            path: 'https://backend.thogupu.com/thogupumail/youtube.png',
            cid: 'youtube@thogupu.com' 
        }]
    };
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
    });
}

let sendInvitationMailer = (clientEmail,membername,memberorg,projectname) => {
    let mailOptions = {
        from: '"Jupiter Brothers" <contact@jupiterbrothers.com>', // sender address
        to: clientEmail, // list of receivers
        subject: 'Thougupu - Project', // Subject line
        text: 'Authentication', // plain text body
        html: '<div style="width: 600px;"> <div style="text-align:center;padding-top: 10px;"> <img src="cid:thogupulogo@thogupu.com"> </div> <div style="padding-top: 20px;"> <div style="background-color: #FAFBFF;padding: 10px 20px 50px 20px;"> <div style="font-weight: 700;font-size: 30px;text-align: center;margin-top: 50px;font-family: Arial, Helvetica, sans-serif;">You’re Invited!</div> <div style="text-align: center;font-size: 16px;font-weight: 400;margin-top: 10px;font-family: Arial, Helvetica, sans-serif;"><span>Hey there,</span><span style="font-size: 18px;font-weight: 900;"> '+membername+' </span> '+memberorg+' invite you to </div> <div style="text-align: center;font-size: 16px;font-weight: 400;margin-top: 5px;font-family: Arial, Helvetica, sans-serif;">join<span style="font-weight:900;font-size: 18px;">'+projectname+'</span><span> project on Thogupu Application</span></div> <div style="text-align: center;padding-top: 50px;"> <img src="cid:invitation@thogupu.com"> </div> <div style="padding: 40px 50px 0px 120px;text-align: center;"> <div style="background-color:#2B90E8;width: 280px; padding: 14px 0px;border-radius: 8px;color:  #FFFFFF;font-weight: 700;font-size: 16px;text-align: center;font-family: Arial, Helvetica, sans-serif;">Join '+projectname+' Project</div> </div> </div> </div> <div style="text-align: center;padding-top:6 0px;"> <img src="cid:jblogo@thogupu.com"> </div> <div style="font-size: 12px;text-align: center;padding-top: 10px;font-family: Arial, Helvetica, sans-serif;">If you have any questions, feel free to message us at contact@jupiterbrothers.com</div> <div style="font-size: 12px;text-align: center;padding-top: 10px;font-weight: 700;font-family: Arial, Helvetica, sans-serif;">Maraneri, Sivakasi, Tamil Nadu, India</div> <div style="display: flex;text-align: center;padding: 10px 0px 0px 223px;"> <a href="https://www.linkedin.com/mwlite/company/jupiterbrothers"> <img src="cid:linkedin@thogupu.com"> </a> <a href="https://m.facebook.com/innovationforaec/?locale2=en_US" style="padding-left: 14px;"> <img src="cid:facebook@thogupu.com"> </a> <a href="https://instagram.com/jupiter.brothers?utm_medium=copy_link" style="padding-left: 14px;"> <img src="cid:instagram@thogupu.com"> </a> <a href="https://twitter.com/jupiterbrothers" style="padding-left: 14px;"> <img src="cid:twitter@thogupu.com"> </a> <a href="https://www.youtube.com/channel/UCn83bZm06GeV8r3OBjKYZ4Q/featured" style="padding-left: 14px;"> <img src="cid:youtube@thogupu.com"> </a> </div> <div style="text-align: center;font-size: 12px;padding-top: 10px;font-family: Arial, Helvetica, sans-serif;">Terms of use | Privacy Policy</div> <div style="padding-top: 10px;"> <div style="background-color: #DB053D;color: white;font-size: 12px;text-align: center;padding: 5px 0px 5px 0px;font-family: Arial, Helvetica, sans-serif;">All rights reserved © Jupiter Brothers Data Science Pvt. Ltd.,</div> </div> </div> </div>', // html body
        attachments: [{
            filename: 'thogupulogo.png',
            path: 'https://backend.thogupu.com/thogupumail/thogupulogo.png',
            cid: 'thogupulogo@thogupu.com' 
        },{
            filename: 'jblogo.png',
            path: 'https://backend.thogupu.com/thogupumail/jblogo.png',
            cid: 'jblogo@thogupu.com' 
        },{
            filename: 'facebook.png',
            path: 'https://backend.thogupu.com/thogupumail/facebook.png',
            cid: 'facebook@thogupu.com' 
        },{
            filename: 'instagram.png',
            path: 'https://backend.thogupu.com/thogupumail/instagram.png',
            cid: 'instagram@thogupu.com' 
        },{
            filename: 'linkedin.png',
            path: 'https://backend.thogupu.com/thogupumail/linkedin.png',
            cid: 'linkedin@thogupu.com' 
        },{
            filename: 'invitation.png',
            path: 'https://backend.thogupu.com/thogupumail/invitation.png',
            cid: 'invitation@thogupu.com' 
        },{
            filename: 'twitter.png',
            path: 'https://backend.thogupu.com/thogupumail/twitter.png',
            cid: 'twitter@thogupu.com' 
        },{
            filename: 'youtube.png',
            path: 'https://backend.thogupu.com/thogupumail/youtube.png',
            cid: 'youtube@thogupu.com' 
        }]
    };
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
    });
}

//SecurtiyCode generate
router.post('/thogupu/securtiyCode', (req, res, next) => {
    let secret = speakEasy.generateSecret({ length: 8 });
    let randomCode = Math.floor(Math.random() * 100).toString();
    let secretCode = secret.base32.slice(0, 6) + randomCode;

    Thogupu.User.findOne({email_id: req.body.emailid,user_status:'draft'}, function(err, data) {
        if (err) {
            return res.status(500).json({
                status: 'An error occurred',
                error: err
            })
        } 
        else if(data==null)
        {
            let user = new Thogupu.User({
                email_id: req.body.emailid,
                secret_code: secretCode,
                super_admin:req.body.emailid,
                created_date: new Date(),
                user_status:'draft'
            });
            user.save(function (err,result) {
                if (err) {
                    return res.status(500).json({
                        title: 'An error occurred',
                        error: err
                    });
                }
                else
                {
                    sendSecretMailer(req.body.emailid, secretCode);
                    res.status(200).json({
                        status: 'success',
                        secretCode: secretCode
                    })
                }
            });
        }
        else
        {
            data.secret_code=secretCode;
            data.save(function(err) {
                if (err) {
                    return res.status(500).json({
                        title: 'An error occurred',
                        error: err
                    })
                } 
                else 
                {
                    sendSecretMailer(req.body.emailid, secretCode);
                    res.status(200).json({
                        status: 'success',
                        secretCode: secretCode
                    })
                }
            });
        }
    });

    /* Thogupu.User.deleteOne({email_id: req.body.emailid,user_status:'draft'}, function(result) {
        Thogupu.User.findOne({email_id: req.body.emailid,user_status:'save'}, function(err, data) {
            if (err) {
                return res.status(500).json({
                    status: 'An error occurred',
                    error: err
                })
            } 
            else if(data==null)
            {
                let user = new Thogupu.User({
                    email_id: req.body.emailid,
                    secret_code: secretCode,
                    created_date: new Date(),
                    user_type:"Project Admin",
                    user_status:'draft',
                    //new_user:'yes'
                });
                user.save(function (err,result) {
                    if (err) {
                        return res.status(500).json({
                            title: 'An error occurred',
                            error: err
                        });
                    }
                    else
                    {
                        sendSecretMailer(req.body.emailid, secretCode);
                        res.status(200).json({
                            status: 'success',
                            secretCode: secretCode
                        })
                    }
                });
            } 
            else 
            {
                res.status(200).json({
                    status: 'already emailid and Password'
                })
            }
        })
    }); */
})

//SecurtiyCode verify
router.post('/thogupu/secretCodeverify', (req, res, next) => {
    Thogupu.User.findOne({email_id: req.body.emailid}, function(err, data) {
        if (data.secret_code === req.body.securitycode) 
        {
            res.status(200).json({
                status: 'success'
            })
        }
        else 
        {
            res.status(200).json({
                status: 'failure'
            })
        }
    });
})


router.post('/thogupu/signup', (req, res, next) => {
    Thogupu.User.findOne({email_id: req.body.emailid}, function(err, data) {
        let password = bcrypt.hashSync(req.body.password, salt);
        data.pass_word = password;
        data.user_status='save';
        data.save(function(err) {
            if (err) {
                return res.status(500).json({
                    title: 'An error occurred',
                    error: err
                })
            } 
            else 
            {
                res.status(200).json({
                    status: 'success'
                })
                /* var aggregateArray=[];
    
                aggregateArray.push({ $match:{project_name: { $ne: null }}});
                aggregateArray.push(
                    { $unwind :  "$organization_info" },
                    { $unwind :  "$organization_info.member_info" },
                    { $match : {'organization_info.member_info.member_email' : req.body.emailid }}
                );
                aggregateArray.push(
                    {
                        $group:
                        {
                            _id: {'_id':'$_id','project_name':'$project_name','project_id':'$project_id'}   
                        }
                    },
                    {
                        $project:
                        {
                            _id:'$_id._id',
                            project_name:'$_id.project_name',
                            project_id:'$_id.project_id'
                        }
                    },
                    { 
                        $sort : { "_id" : -1}
                    }
                );
                Thogupu.Project.aggregate(aggregateArray, function (err, result) {
                    if (err) {
                        next(err);
                    } 
                    else 
                    {
                        if(result.length>0)
                        {
                            var token = jwt.sign({ uid: data._id, uname: data.user_name,uemail: data.email_id,uorg:data.organization_name }, secret_key, { expiresIn: 86400 });
                            var prjtId=result[0]._id;
                            res.status(200).json({
                                status: 'success',
                                prjtId:prjtId,
                                count:result.length,
                                token
                            })
                        }   
                        else
                        {
                            Thogupu.App.find({}, (err, apps) => {
                                var appInfo=[];
                                apps.forEach(function(item){
                                    appInfo.push({
                                        '_id':new ObjectId(),
                                        app_name:item.app_name,
                                        app_logo:item.app_logo,
                                        app_desc:item.app_desc,
                                        app_price:item.app_price,
                                        total_member:item.total_member,
                                        app_url:item.app_url,
                                        app_status:'Inactive'
                                    });
                                });

                                var prjtId=new ObjectId();
                                var project=new Thogupu.Project({
                                    '_id':prjtId,
                                    email_id:req.body.emailid,
                                    project_status:'draft',
                                    app_info:appInfo
                                });
                                project.save(function(err) {
                                    if (err) {
                                        return res.status(500).json({
                                            title: 'An error occurred',
                                            error: err
                                        })
                                    } 
                                    else 
                                    {
                                        res.status(200).json({
                                            status: 'success',
                                            prjtId:prjtId,
                                            count:0
                                        })
                                    }
                                });
                            });
                        }
                    }
                }); */
            }
        });
    });
})

//login
router.post('/thogupu/checkuserexist', function(req, res, next) {
    Thogupu.User.findOne({ email_id: req.body.emailid }, function(err, data) {
        if (data == null) 
        {
            res.status(201).json({
                msg: 'failure'
            });
        }
        else
        {
            res.status(201).json({
                msg: 'success'
            });
        }
    });
});

router.post('/thogupu/loginuser', function(req, res, next) {
    Thogupu.User.findOne({ email_id: req.body.emailid }, function(err, data) {
        bcrypt.compare(req.body.password, data.pass_word, function(err, doesMatch) {
            if (doesMatch) 
            {
                var token = jwt.sign({ uid: data._id, uname: data.user_name,uemail: data.email_id,uorg:data.organization_name }, secret_key, { expiresIn: 86400 });
                Thogupu.Project.aggregate([
                    { $match : {project_status : 'save' }}, 
                    { $unwind :  "$organization_info" },
                    { $unwind :  "$organization_info.member_info" },
                    { $match : {'organization_info.member_info.member_email' : data.email_id }},
                    {
                        $group:
                        {
                            _id: {'_id':'$_id','project_name':'$project_name','project_status':'$project_status'}   
                        }
                    },
                    {
                        $project:
                        {
                            _id:'$_id._id',
                            project_name:'$_id.project_name',
                            project_status:'$_id.project_status'
                        }
                    },
                    { 
                        $sort : { "_id" : -1}
                    }
                ], function (err, result) {
                    if (err) {
                        next(err);
                    } 
                    else 
                    {
                        var prjtExist='no';
                        var prjtId='';
                        if(result.length>0)
                        {
                            prjtExist='yes';
                            var saveIndex=result.findIndex(x => x.project_status == 'save');
                            if(saveIndex>=0)
                            {
                                prjtId=result[saveIndex]._id;
                            }
                            else
                            {
                                var draftIndex=result.findIndex(x => x.project_status == 'draft');
                                if(draftIndex>0)
                                {
                                    prjtId=result[draftIndex]._id;
                                }
                            }
                        }
                        res.status(201).json({
                            token: token,
                            prjtId:prjtId,
                            prjtExist:prjtExist,
                            msg: 'success'
                        });
                    }
                });
            } 
            else 
            {
                res.status(201).json({
                    msg: 'failure'
                });
            }
        });
    });
});

router.get('/thogupu/getuserdetails/:umail', function(req, res, next) {
    Thogupu.User.findOne({ email_id: req.params.umail }, function(err, data) {
        if(data==null)
        {
            res.status(201).json({
                user_name:'',
                msg: 'fail'
            });
        }
        else
        {
            res.status(201).json({
                user_name:data.user_name,
                msg: 'success'
            });
        }
    });
});

router.post('/thogupu/resetpassword', (req, res, next) => {
    let secret = speakEasy.generateSecret({ length: 8 });
    let randomCode = Math.floor(Math.random() * 100).toString();
    let secretCode = secret.base32.slice(0, 6) + randomCode;

    Thogupu.User.findOne({email_id: req.body.emailid,user_status:'save'}, function(err, data) {
        if (err) {
            return res.status(500).json({
                status: 'An error occurred',
                error: err
            })
        } 
        else 
        {
            data.secret_code=secretCode;
            data.save(function(err) {
                if (err) {
                    return res.status(500).json({
                        title: 'An error occurred',
                        error: err
                    })
                } 
                else 
                {
                    sendSecretMailer(req.body.emailid, secretCode);
                    res.status(200).json({
                        status: 'success',
                        secretCode: secretCode
                    })
                }
            });
        }
    });
})

router.get('/thogupu/getfirstprojectdtl/:umail', function(req, res, next) {
    var aggregateArray=[];
    
    aggregateArray.push({ $match:{project_name: { $ne: null }}});
    aggregateArray.push(
        { $unwind :  "$organization_info" },
        { $unwind :  "$organization_info.member_info" },
        { $match : {'organization_info.member_info.member_email' : req.params.umail }}
    );
    aggregateArray.push(
        {
            $group:
            {
                _id: {'_id':'$_id','project_name':'$project_name','project_id':'$project_id'}   
            }
        },
        {
            $project:
            {
                _id:'$_id._id',
                project_name:'$_id.project_name',
                project_id:'$_id.project_id'
            }
        },
        { 
            $sort : { "_id" : -1}
        }
    );
    Thogupu.Project.aggregate(aggregateArray, function (err, result) {
        if (err) {
            next(err);
        } 
        else 
        {
            var count=0;
            var prjtId='';
            if(result.length>0)
            {
                count=result.length;
                prjtId=result[0]._id;
            }
            res.status(201).json({
                count:count,
                prjtId:prjtId,
                msg: 'success'
            });
        }
    });
});

//display all Countries
router.get('/thogupu/getcountries', (req, res, next) => {

    Thogupu.Country.aggregate([
        {
            $group:
            {
                _id: {'_id':'$_id','country_name':'$country_name'}   
            }
        },
        {
            $project:
            {
                _id:'$_id._id',
                country_name:'$_id.country_name'
            }
        },
        { 
            $sort : { "country_name" : 1}
        }
    ], function (err, result) {
        if (err) {
            next(err);
        } 
        else 
        {
            res.json(result)
        }
    });
});

//dispaly mail and auto fill

router.get('/thogupu/getusers',jwtAuth,(req,res,next)=>{
 
    Thogupu.User.aggregate([
        { $match: {$or:[{ organization_name:req.userOrg },{ super_admin:req.userEmail }]} },
        {
            $group:
            {
                _id: {'_id':'$_id','user_name':'$user_name','email_id':'$email_id','designation_name':'$designation_name','role_name':'$role_name','organization_name':'$organization_name','profile_path':'$profile_path'}   
            }
        },
        {
            $project:
            {
                _id:'$_id._id',
                user_name:'$_id.user_name',
                email_id:'$_id.email_id',
                designation_name:'$_id.designation_name',
                role_name:'$_id.role_name',
                organization_name:'$_id.organization_name',
                profile_path:'$_id.profile_path'
            }
        },
        {
            $sort : {"_id" : 1}
        }
    ],
    function (err, result) {
        if (err) {
            next(err);
        } 
        else 
        {
            res.json(result)
        }
    })
})

//display all cities
router.get('/thogupu/getstates/:cname', (req, res, next) => {
    Thogupu.Country.aggregate([
        { $match:{country_name:req.params.cname}},
        { $unwind :  "$state_info" },
        {
            $group:
            {
                _id: {'_id':'$state_info._id','state_name':'$state_info.state_name'}   
            }
        },
        {
            $project:
            {
                _id:'$_id._id',
                state_name:'$_id.state_name'
            }
        },
        { 
            $sort : { "state_name" : 1}
        }
    ], function (err, result) {
        if (err) {
            next(err);
        } 
        else 
        {
            res.json(result)
        }
    });
})

//display all cities
router.get('/thogupu/getcities/:cname/:sname', (req, res, next) => {
    Thogupu.Country.aggregate([
        { $match:{"country_name":req.params.cname}},
        { $unwind :  "$state_info" },
        { $match:{"state_info.state_name":req.params.sname}},
        { $unwind :  "$state_info.city_info" },
        {
            $group:
            {
                _id: {'_id':'$state_info.city_info._id','city_name':'$state_info.city_info.city_name'}   
            }
        },
        {
            $project:
            {
                _id:'$_id._id',
                city_name:'$_id.city_name'
            }
        },
        { 
            $sort : { "city_name" : 1}
        }
    ], function (err, result) {
        if (err) {
            next(err);
        } 
        else 
        {
            res.json(result)
        }
    });
})

//display all stackholder info
router.get('/thogupu/stackholderlist', (req, res, next) => {
    Thogupu.Stack.find({}, (err, stacksinfo) => {
        if (err) {
            return res.status(500).json({
                title: 'An error occurred',
                error: err
            })
        } else {
            res.json(stacksinfo)
        }
    })
})

//display all type info
router.get('/thogupu/getprojecttype', (req, res, next) => {
    Thogupu.PType.find({}, (err, types) => {
        if (err) {
            return res.status(500).json({
                title: 'An error occurred',
                error: err
            })
        } else {
            res.json(types)
        }
    })
})

router.get('/thogupu/addprojecttype/:ptype', (req, res, next) => {
    let ptype = new Thogupu.PType({
        project_type:req.params.ptype
    });
    ptype.save(function (err,result) {
        if (err) {
            return res.status(500).json({
                title: 'An error occurred',
                error: err
            });
        }
        else
        {
            Thogupu.PType.find({}, (err, types) => {
                if (err) {
                    return res.status(500).json({
                        title: 'An error occurred',
                        error: err
                    })
                } else {
                    res.json(types)
                }
            })
        }
    });
}); 

router.get('/thogupu/addprojectsubtype/:ptype/:psubtype', (req, res, next) => {
    Thogupu.PType.findOne({ project_type: req.params.ptype }, function(err, data) {
        data.subtype_info.push({
            '_id':new ObjectId(),
            project_subtype:req.params.psubtype
        });
        data.save(function(err) {
            if (err) {
                return res.status(500).json({
                    title: 'An error occurred',
                    error: err
                });
            }
            else
            {
                res.json('saved');
            }
        });
    });
}); 

//display all category
router.get('/thogupu/grouplist', (req, res, next) => {
    Thogupu.Group.find({}, (err, types) => {
        if (err) {
            return res.status(500).json({
                title: 'An error occurred',
                error: err
            })
        } else {
            res.json(types)
        }
    })
})

//display all service
router.get('/thogupu/getservices', (req, res, next) => {
    Thogupu.Service.find({}, (err, services) => {
        if (err) {
            return res.status(500).json({
                title: 'An error occurred',
                error: err
            })
        } else {
            res.json(services)
        }
    })
})

router.post("/uploadtoollogo/:umail", function(req, res) {
    var multer = require('multer');
    var fs= require('fs');
    var img_url="";
    var imgicon = multer.diskStorage({
        destination: function(req, file, callback) {
            if (!fs.existsSync('public/toollogo/'+req.params.umail))
            {
                fs.mkdirSync('public/toollogo/'+req.params.umail);   
            }
            else
            {
                var testFolder = 'public/toollogo/'+req.params.umail;
                fs.readdirSync(testFolder).forEach(file => {
                    fs.unlinkSync(testFolder+'/'+file);
                })
            }
            callback(null,'public/toollogo/'+req.params.umail);
        },
        filename: function(req, file, callback) {
            callback(null, file.originalname);
            img_url='toollogo/'+req.params.umail+'/'+file.originalname;
        }
    });
 
    var itemupload = multer({ storage: imgicon }).single('uploads');

    itemupload(req, res, function(err) {
        if (err) {
            return res.send({ status: 'Error uploading file' });
        }
        else
        {
            res.send({ url: img_url });
        }
    });
});

router.post("/uploadcompanylogo/:umail", function(req, res) {
    var multer = require('multer');
    var fs= require('fs');
    var img_url="";
    var imgicon = multer.diskStorage({
        destination: function(req, file, callback) {
            if (!fs.existsSync('public/orglogo/'+req.params.umail))
            {
                fs.mkdirSync('public/orglogo/'+req.params.umail);   
            }
            else
            {
                var testFolder = 'public/orglogo/'+req.params.umail;
                fs.readdirSync(testFolder).forEach(file => {
                    fs.unlinkSync(testFolder+'/'+file);
                })
            }
            callback(null,'public/orglogo/'+req.params.umail);
        },
        filename: function(req, file, callback) {
            callback(null, file.originalname);
            img_url='orglogo/'+req.params.umail+'/'+file.originalname;
        }
    });
 
    var itemupload = multer({ storage: imgicon }).single('uploads');

    itemupload(req, res, function(err) {
        if (err) {
            return res.send({ status: 'Error uploading file' });
        }
        else
        {
            res.send({ url: img_url });
        }
    });
});

//display all category
router.get('/thogupu/getdesignation', (req, res, next) => {
    Thogupu.Desig.find({}, (err, desigs) => {
        if (err) {
            return res.status(500).json({
                title: 'An error occurred',
                error: err
            })
        } else {
            res.json(desigs) 
        }
    })
})

router.post("/uploadprofile/:umail", function(req, res) {
    var multer = require('multer');
    var fs= require('fs');
    var img_url="";
    var img_name='';
   
    var imgicon = multer.diskStorage({
        destination: function(req, file, callback) {
            if (!fs.existsSync('public/profile/'+req.params.umail))
            {
                fs.mkdirSync('public/profile/'+req.params.umail);   
            }
            else
            {
                var testFolder = 'public/profile/'+req.params.umail; 
                fs.readdirSync(testFolder).forEach(file => {
                    fs.unlinkSync(testFolder+'/'+file);
                    console.log(testFolder)
                })
            }
            callback(null,'public/profile/'+req.params.umail);
        },
        filename: function(req, file, callback) {
            callback(null, file.originalname);
            img_url='/profile/'+req.params.umail+'/'+file.originalname;
            img_name=file.originalname;
        }
    });
 
    var itemupload = multer({ storage: imgicon }).single('uploads');

    itemupload(req, res, function(err) {
        if (err) {
            return res.send({ status: 'Error uploading file' });
        }
        else
        {
            res.send({ url: img_url,img_name:img_name});
        }
    });
});

//display all Role
router.get('/thogupu/rolelist', (req, res, next) => {
    Thogupu.Role.find({}, (err, subtypes) => {
        if (err) {
            return res.status(500).json({
                title: 'An error occurred',
                error: err
            })
        } else {
            res.status(200).json({
                status: 'success',
                totalsubtypes: subtypes.length,
                data: subtypes,
            })
        }
    })
})

//display all Designation
router.get('/thogupu/designationlist', (req, res, next) => {
    Thogupu.Designation.find({}, (err, subtypes) => {
        if (err) {
            return res.status(500).json({
                title: 'An error occurred',
                error: err
            })
        } else {
            res.status(200).json({
                status: 'success',
                totalsubtypes: subtypes.length,
                data: subtypes,
            })
        }
    })
})

//display all ORganization
router.get('/thogupu/organizationlist', (req, res, next) => {
    Thogupu.Organizationinfo.find({}, (err, subtypes) => {
        if (err) {
            return res.status(500).json({
                title: 'An error occurred',
                error: err
            })
        } else {
            res.status(200).json({
                status: 'success',
                totalsubtypes: subtypes.length,
                data: subtypes,
            })
        }
    })
})

router.get('/thogupu/getbasicdetails/:umail', (req, res, next) => {

    Thogupu.User.findOne({ email_id: req.params.umail }, function(err, data) {

        res.status(201).json({
            msg:'saved',
            user_name: data.user_name,
            organization_name: data.organization_name,
            organization_role: data.organization_role,
            user_address: data.user_address,
            user_country: data.user_country,
            user_state:data.user_state,
            user_city: data.user_city,
            user_zipcode: data.user_zipcode,
            stack_holder: data.stack_holder,
            functional_role: data.functional_role,
            contact_no: data.contact_no
        });
    console.log( data.contact_no)
    });
});

router.get('/thogupu/getprojectdetails/:pid', (req, res, next) => {
    Thogupu.Project.findById(ObjectId(req.params.pid),function(err, data){ 
        res.status(201).json({
            msg:'saved',
            project_name: data.project_name,
            project_address: data.project_address,
            project_country: data.project_country,
            project_state: data.project_state,
            project_city: data.project_city,
            project_zipcode: data.project_zipcode,
            project_category: data.project_category,
            projectarea_sqft: data.projectarea_sqft,
            projectarea_sqmt: data.projectarea_sqmt,
            project_type: data.project_type,
            project_subtype: data.project_subtype,
            service_info: data.service_info,
            organization_info: data.organization_info
        });
    });
});

router.post('/thogupu/savebasicdetails/:umail', (req, res, next) => {
    Thogupu.User.findOne({ email_id: req.params.umail }, function(err, data) {
        //data.user_name=req.body.user_name;
        //data.organization_name=req.body.organization_name;
        data.organization_role=req.body.organization_role;
        data.user_address=req.body.user_address;
        data.user_country=req.body.user_country;
        data.user_state=req.body.user_state;
        data.user_city=req.body.user_city;
        data.user_zipcode=req.body.user_zipcode;
        data.stack_holder=req.body.stack_holder;
        data.functional_role=req.body.functional_role;
        data.contact_no=req.body.contact_no;
        data.save(function(err) {
            if (err) {
                return res.status(500).json({
                    title: 'An error occurred',
                    error: err
                })
            } 
            else 
            {
                res.status(201).json({
                    msg:'saved'
                });
               /*  Thogupu.App.find({}, (err, apps) => {
                    var appInfo=[];
                    apps.forEach(function(item){
                        appInfo.push({
                            '_id':new ObjectId(),
                            app_name:item.app_name,
                            app_logo:item.app_logo,
                            app_desc:item.app_desc,
                            app_price:item.app_price,
                            total_member:item.total_member,
                            app_url:item.app_url,
                            app_status:'Inactive'
                        });
                    });
    
                    var prjtId=new ObjectId();
                    var org_info=[{
                        '_id':new ObjectId(),
                        organization_name:req.body.organization_name,
                        organization_role:req.body.organization_role,
                        organization_logo:'',
                        member_info:[{
                            '_id':new ObjectId(),
                            member_name:req.body.user_name,
                            member_photo:'',
                            member_email:req.params.umail,
                            member_role:'Project Admin',
                            member_designation:req.body.functional_role,
                            member_organization:req.body.organization_name
                        }]
                    }]
                    var project=new Thogupu.Project({
                        '_id':prjtId,
                        project_name:'General',
                        project_id:'Not Applicable',
                        project_status:'save',
                        created_by:req.params.umail,
                        created_date:new Date(),
                        app_info:appInfo,
                        organization_info:org_info
                    });
                    project.save(function(err) {
                        if (err) {
                            return res.status(500).json({
                                title: 'An error occurred',
                                error: err
                            })
                        } 
                        else 
                        {
                            var token = jwt.sign({ uid: data._id,uname: req.body.user_name, uemail: req.params.umail,uorg:req.body.organization_name,udesg:req.body.functional_role }, secret_key, { expiresIn: 86400 });
                            res.status(201).json({
                                msg:'saved',
                                token,
                                prjtId
                            });
                        }
                    })
                }); */
            }
        });
    });
    /* Thogupu.Project.findById(ObjectId(req.params.pid),function(err, data){ 
        data.user_name=req.body.user_name;
        data.organization_name=req.body.organization_name;
        data.organization_role=req.body.organization_role;
        data.user_address=req.body.user_address;
        data.user_country=req.body.user_country;
        data.user_state=req.body.user_state;
        data.user_city=req.body.user_city;
        data.user_zipcode=req.body.user_zipcode;
        data.stack_holder=req.body.stack_holder;
        data.functional_role=req.body.functional_role;
        data.contact_no=req.body.contact_no;
        data.organization_info.push({
            '_id':new ObjectId(),
            organization_name:req.body.organization_name,
            organization_role:req.body.organization_role,
            organization_logo:'',
            member_info:[{
                '_id':new ObjectId(),
                member_name:req.body.user_name,
                member_photo:'',
                member_email:req.body.email_id,
                member_role:'Project Admin',
                member_designation:req.body.functional_role,
                member_organization:req.body.organization_name,
            }]
        });
        data.save(function(err) {
            if (err) {
                return res.status(500).json({
                    title: 'An error occurred',
                    error: err
                })
            } 
            else 
            {
                Thogupu.User.findOne({ email_id: req.body.email_id }, function(err, data) {
                    data.user_name=req.body.user_name;
                    data.organization_name=req.body.user_name;
                    data.user_name=req.body.user_name;
                    data.designation_name=req.body.functional_role;

                    var token = jwt.sign({ uid: data._id,uname: data.user_name, uemail: req.body.email_id,udesg:data.designation_name }, secret_key, { expiresIn: 86400 });

                    data.save(function(err) {
                        if (err) {
                            return res.status(500).json({
                                title: 'An error occurred',
                                error: err
                            })
                        } 
                        else 
                        {
                            res.status(201).json({
                                msg:'saved',
                                token
                            });
                        }
                    });
                });
            }
        });
    }); */
});

router.post('/thogupu/saveprojectdetails/:pid/:page',jwtAuth, (req, res, next) => {
    var bulk = Thogupu.Project.collection.initializeUnorderedBulkOp();
   /*  if(req.params.page=='Basic_details')
    {
        Thogupu.Project.findById(ObjectId(req.params.pid),function(err, data){ 

            data.user_name=req.body.user_name;
            data.organization_name=req.body.organization_name;
            data.organization_role=req.body.organization_role;
            console.log(data.organization_role);
            data.user_address=req.body.user_address;
            data.user_country=req.body.user_country;
            data.user_state=req.body.user_state;
            data.user_city=req.body.user_city;
            data.user_zipcode=req.body.user_zipcode;
            data.stack_holder=req.body.stack_holder;
            data.functional_role=req.body.functional_role;
            data.contact_no=req.body.contact_no;
            data.organization_info.push({
                '_id':new ObjectId(),
                organization_name:req.body.organization_name,
                organization_role:req.body.organization_role,
                organization_logo:'',
                member_info:[{
                    '_id':new ObjectId(),
                    member_name:req.body.user_name,
                    member_photo:'',
                    member_email:req.userEmail,
                    member_role:'Project Admin',
                    member_designation:req.body.functional_role,
                    member_organization:req.body.organization_name,
                }]
            });
            data.save(function(err) {
                if (err) {
                    return res.status(500).json({
                        title: 'An error occurred',
                        error: err
                    })
                } 
                else 
                {
                    Thogupu.User.findOne({ email_id: req.userEmail }, function(err, data) {
                        data.user_name=req.body.user_name;
                        data.organization_name=req.body.user_name;
                        data.user_name=req.body.user_name;
                        data.role_name="Project Admin";
                        data.designation_name=req.body.functional_role;
                        data.save(function(err) {
                            if (err) {
                                return res.status(500).json({
                                    title: 'An error occurred',
                                    error: err
                                })
                            } 
                            else 
                            {
                                res.status(201).json({
                                    msg:'saved'
                                });
                            }
                        });
                    });
                }
            });
        });
    }
    else */ 
    if(req.params.page=='projectDetails')
    {
        bulk.find( { '_id': ObjectId(req.params.pid)} ).update( { $set: req.body } );
        bulk.execute();
        res.status(201).json({
            msg:'saved'
        });
    }
    else if(req.params.page=='memberDetails_addOrg' || req.params.page=='memberDetails_addMember')
    {
        var orgInfo=[];
        var memberInfo=[];
        var newUsers=[];
        Thogupu.Project.findById(ObjectId(req.params.pid),function(err, data){ 
            Thogupu.User.find({}, (err, users) => {
                if(req.body.organization_info)
                {
                    req.body.organization_info.forEach(function(item){
                        item.member_info.forEach(function(item1){
                            memberInfo.push({
                                '_id':new ObjectId(),
                                member_name: item1.member_name,
                                member_photo: item1.member_photo,
                                member_email: item1.member_email,
                                member_role: item1.member_role,
                                member_designation: item1.member_designation,
                                member_organization: item1.member_organization
                            });
                            
                            var userIndex=users.findIndex(x => x.email_id == item1.member_email);
                            if(userIndex<0)
                            {
                                var randomstring = Math.random().toString(36).slice(-8);
                                var passwordToSave = bcrypt.hashSync(randomstring, salt);

                                newUsers.push({
                                    email_id: item1.member_email,
                                    pass_word: passwordToSave,
                                    created_date: new Date(),
                                    user_status:'draft',
                                    user_name:item1.member_name,
                                    organization_name:item1.member_organization,
                                    designation_name:item1.member_designation,
                                    role_name:item1.member_role,
                                    super_admin:req.userEmail
                                });
                                sendInvitationMailer(item1.member_email,item1.member_name,item1.member_organization,data.project_name);
                            }
                        });
                        orgInfo.push({
                            '_id':new ObjectId(),
                            organization_name: item.organization_name, 
                            organization_role: item.organization_role,
                            organization_logo: item.organization_logo,
                            member_info:memberInfo
                        });
                        memberInfo=[];
                    });
                    bulk.find( { '_id': ObjectId(req.params.pid)} ).update( { $set: { 'organization_info':orgInfo} } );
                    bulk.execute();
                }

                if(newUsers.length>0)
                {
                    Thogupu.User.insertMany(newUsers, function (err, docs) {
                        if (err){ 
                            return console.error(err);
                        } 
                        else 
                        {
                        console.log("Multiple documents inserted to Collection");
                        res.json('saved');
                        }
                    });
                }
                else
                {
                    res.status(201).json({
                        msg:'saved'
                    });
                }
            });
        });
    }
    else if(req.params.page=='memberDetails_addsummary')
    {
        Thogupu.Project.findById(ObjectId(req.params.pid),function(err, data){ 
            Thogupu.Country.findOne({country_name: data.project_country }, function(err, data2) {
                Thogupu.Project.findOne({$and:[{project_status:'save'},{project_name: { $ne: 'General' }}]}).sort({_id: -1}).exec(function(err, data1) {
                    var str;
                    if(data1==null)
                    {
                        str = '2000';
                    }
                    else
                    {
                        str = data1.project_id;
                    }
                    var projectId= data2.country_code+'-'+(new Date().getMonth() + 1).toString().padStart(2, "0")+new Date().getFullYear().toString().substr(-2)+'-'+(parseInt(str.substring(str.length - 4))+1);

                    data.project_id=projectId;
                    data.project_status='save';
                    data.created_date= new Date();
                    data.save(function(err) {
                        if (err) {
                            return res.status(500).json({
                                title: 'An error occurred',
                                error: err
                            })
                        } 
                        else 
                        {
                            // Free trail tool
                            var prjtService=[];
                            data.service_info.forEach(function(item){
                                prjtService.push({
                                    '_id':new ObjectId(),
                                    service_name:item
                                });
                            })
                            var prjtSubType=[];
                            data.project_subtype.forEach(function(item){
                                prjtSubType.push({
                                    '_id':new ObjectId(),
                                    project_subtype:item
                                });
                            });

                            var teamInfo=[];
                            data.organization_info.forEach(function(org){
                                org.member_info.forEach(function(item){
                                    teamInfo.push({
                                        '_id':new ObjectId(),
                                        user_name:item.member_name,
                                        designation:item.member_designation,
                                        email_id:item.member_email,
                                        profile_img:item.member_photo,
                                        user_role:item.member_role,
                                        user_status:'Active'
                                    });
                                });
                            });

                            let project = new Enthiran.Project({
                                project_name:data.project_name,
                                project_id:data.project_id,
                                projectarea_sqft:data.projectarea_sqft,
                                projectarea_sqmt:data.projectarea_sqmt,
                                drawing_filepath:'',
                                client_name:'',
                                architect_name:'',
                                created_by:data.created_by,
                                created_date:new Date(),
                                project_type:data.project_type,
                                project_subtype_info:prjtSubType,
                                project_country:data.project_country,
                                project_state:data.project_state,
                                project_city:data.project_city,
                                project_status:'draft',
                                manager_info:[],
                                leader_info:[],
                                engineers_info:[],
                                team_info:teamInfo,
                                revision_info:[{
                                    '_id':new ObjectId(),
                                    revision_name:'R0',
                                    revision_status:'save',
                                    created_by:data.created_by,
                                    created_date:new Date(),
                                    project_services:prjtService,
                                    project_systems:[],
                                    project_items:[],
                                    project_main_category:[],
                                    project_sub_category:[],
                                    project_parameter:[],
                                    project_codes:[], 
                                    deliverable_info:[]
                                }]
                            });
                            project.save(function (err,result) {
                                if (err) {
                                    return res.status(500).json({
                                        title: 'An error occurred',
                                        error: err
                                    });
                                }
                                else
                                {
                                    res.status(201).json({
                                        msg:'saved'
                                    });
                                }
                            });
                        }
                    });
                });
            });
        });
    }
});


router.get('/thogupu/getprojectlist/:umail/:pid', (req, res, next) => {
    var aggregateArray=[];
    
    aggregateArray.push({ $match:{project_name: { $ne: null }}});
    aggregateArray.push(
        { $unwind :  "$organization_info" },
        { $unwind :  "$organization_info.member_info" },
        { $match : {'organization_info.member_info.member_email' : req.params.umail }}
    );
    
    aggregateArray.push({
        $group:
        {
            _id: {'_id':'$_id','project_name':'$project_name','project_id':'$project_id','project_country':'$project_country','project_state':'$project_state','project_city':'$project_city','project_zipcode':'$project_zipcode','projectarea_sqft':'$projectarea_sqft','projectarea_sqmt':'$projectarea_sqmt','project_type':'$project_type','project_subtype':'$project_subtype','project_status':'$project_status','service_info':'$service_info','app_info':'$app_info','building_info':'$building_info'}   
        }
        },
        {
            $project:
            {
                _id:'$_id._id',
                project_name:'$_id.project_name',
                project_id:'$_id.project_id',
                project_country:'$_id.project_country',
                project_state:'$_id.project_state',
                project_city:'$_id.project_city',
                project_zipcode:'$_id.project_zipcode',
                projectarea_sqft:'$_id.projectarea_sqft',
                projectarea_sqmt:'$_id.projectarea_sqmt',
                project_type:'$_id.project_type',
                project_subtype:'$_id.project_subtype',
                project_status:'$_id.project_status',
                service_info:'$_id.service_info',
                building_info:'$_id.building_info',
                app_info:'$_id.app_info'
            }
        },
        { 
            $sort : { "_id" : -1}
        }
    );
    Thogupu.Project.aggregate(aggregateArray, function (err, result) {
        if (err) {
            next(err);
        } 
        else 
        {
            var pIndex=result.findIndex(x => x._id == req.params.pid);
            var allApplication=[];
            var singleApplication=[];
            var yourApplication=[];
            var memberInfo=[];
            Thogupu.Project.findById(ObjectId(req.params.pid),function(err, data2){ 

                data2.organization_info.forEach(function(item){
                    item.member_info.forEach(function(item1){
                        memberInfo.push({
                            member_name:item1.member_name,
                            member_email:item1.member_email,
                            member_designation:item1.member_designation,
                            member_organization:item1.member_organization
                        });
                    });
                }); 

                result[pIndex].app_info.forEach(function(item){
                    if(item.app_status=='Inactive' && item.app_name!='All Apps')
                    {
                        singleApplication.push({
                            _id:item._id,
                            app_name : item.app_name,
                            app_logo : item.app_logo,
                            app_desc : item.app_desc,
                            app_price : item.app_price,
                            total_member : item.total_member,
                            app_status:item.app_status
                        });
                    }
                    else if(item.app_status=='Inactive' && item.app_name=='All Apps')
                    {
                        allApplication.push({
                            _id:item._id,
                            app_name : item.app_name,
                            app_logo : item.app_logo,
                            app_desc : item.app_desc,
                            app_price : item.app_price,
                            total_member : item.total_member,
                            app_status:item.app_status
                        });
                    }
                    else if(item.app_status=='Active' && item.app_name!='All Apps')
                    {
                        yourApplication.push({
                            _id:item._id,
                            app_name : item.app_name,
                            app_logo : item.app_logo,
                            app_desc : item.app_desc,
                            app_price : item.app_price,
                            total_member : item.total_member,
                            app_status:item.app_status
                        });
                    }
                });

                Enthiran.Project.findOne({project_id: result[pIndex].project_id }, function(err, data) {
                    var systems=[];
                    var items=[];
                    var mcatgs=[];
                    var scatgs=[];
                    var codes=[];
                    var client_name='';
                    var architect_name='';
                    var drawing_filepath='';
                    if(data!=null)
                    {
                        client_name=data.client_name;
                        architect_name=data.architect_name;
                        drawing_filepath=data.drawing_filepath;
                        var r=data.revision_info[data.revision_info.length-1];
                       
                        r.project_systems.forEach(function(item){
                            systems.push(item.system_name)
                        });
                        r.project_items.forEach(function(item){
                            items.push(item.item_name)
                        });
                        r.project_main_category.forEach(function(item){
                            mcatgs.push(item.main_category_name)
                        });
                        r.project_sub_category.forEach(function(item){
                            scatgs.push(item.sub_category_name)
                        });
                        r.project_codes.forEach(function(item){
                            codes.push(item.code_name)
                        });
                    }
                    res.status(201).json({
                        projectsList:result,
                        project_id:result[pIndex].project_id,
                        project_name:result[pIndex].project_name,
                        project_country:result[pIndex].project_country,
                        project_state:result[pIndex].project_state,
                        project_city:result[pIndex].project_city,
                        project_zipcode:result[pIndex].project_zipcode,
                        projectarea_sqft:result[pIndex].projectarea_sqft,
                        projectarea_sqmt:result[pIndex].projectarea_sqmt,
                        project_type:result[pIndex].project_type,
                        project_subtype:result[pIndex].project_subtype,
                        service_info:result[pIndex].service_info,
                        building_info:result[pIndex].building_info,
                        client_name:client_name,
                        architect_name:architect_name,
                        drawing_filepath:drawing_filepath,
                        project_systems:systems,
                        project_items:items,
                        project_main_category:mcatgs,
                        project_sub_category:scatgs,
                        project_codes:codes,
                        allApplication:allApplication,
                        singleApplication:singleApplication,
                        yourApplication:yourApplication,
                        memberInfo:memberInfo
                    });
                });
            });
        }
    });
});


router.get('/thogupu/buyapp/:pid/:aid', (req, res, next) => {
    Thogupu.Project.findById(ObjectId(req.params.pid),function(err, data){ 
        if(data.app_info.id(ObjectId(req.params.aid)).app_name=='All Apps')
        {
            data.app_info.forEach(function(item){
                item.app_status='Active'
            });
        }
        else
        {
            data.app_info.id(ObjectId(req.params.aid)).app_status='Active';
        }
        data.save(function(err) {
            if (err) {
                return res.status(500).json({
                    title: 'An error occurred',
                    error: err
                })
            } 
            else 
            {
                var allApplication=[];
                var singleApplication=[];
                var yourApplication=[];
                data.app_info.forEach(function(item){
                    if(item.app_status=='Inactive' && item.app_name!='All Apps')
                    {
                        singleApplication.push({
                            _id:item._id,
                            app_name : item.app_name,
                            app_logo : item.app_logo,
                            app_desc : item.app_desc,
                            app_price : item.app_price,
                            total_member : item.total_member,
                            app_status:item.app_status
                        });
                    }
                    else if(item.app_status=='Inactive' && item.app_name=='All Apps')
                    {
                        allApplication.push({
                            _id:item._id,
                            app_name : item.app_name,
                            app_logo : item.app_logo,
                            app_desc : item.app_desc,
                            app_price : item.app_price,
                            total_member : item.total_member,
                            app_status:item.app_status
                        });
                    }
                    else if(item.app_status=='Active' && item.app_name!='All Apps')
                    {
                        yourApplication.push({
                            _id:item._id,
                            app_name : item.app_name,
                            app_logo : item.app_logo,
                            app_desc : item.app_desc,
                            app_price : item.app_price,
                            total_member : item.total_member,
                            app_status:item.app_status
                        });
                    }
                });
                res.status(201).json({
                    allApplication:allApplication,
                    singleApplication:singleApplication,
                    yourApplication:yourApplication
                });
            }
        });
    });
});

router.post('/thogupu/creategeneralproject', (req, res, next) => {
    Thogupu.User.findOne({ email_id: req.body.emailid }, function(err, data) {
        data.user_name=req.body.user_name;
        data.organization_name=req.body.org_name;
        var org_role='';
        if(req.body.org_role!='undefined' && req.body.org_role!='')
        {
            org_role=req.body.org_role
            data.organization_role=org_role;
        }
        var contact_no='';
        if(req.body.contact_no!='undefined' && req.body.contact_no!='')
        {
            contact_no=req.body.contact_no;
            data.contact_no=contact_no;
        }
        data.user_status='save';
        data.save(function(err) {
            if (err) {
                return res.status(500).json({
                    title: 'An error occurred',
                    error: err
                })
            } 
            else 
            {
                Thogupu.App.find({}, (err, apps) => {
                    var appInfo=[];
                    apps.forEach(function(item){
                        appInfo.push({
                            '_id':new ObjectId(),
                            app_name:item.app_name,
                            app_logo:item.app_logo,
                            app_desc:item.app_desc,
                            app_price:item.app_price,
                            total_member:item.total_member,
                            app_url:item.app_url,
                            app_status:'Inactive'
                        });
                    });
    
                    var prjtId=new ObjectId();
                    var org_info=[{
                        '_id':new ObjectId(),
                        organization_name:req.body.org_name,
                        organization_role:org_role,
                        organization_logo:'',
                        member_info:[{
                            '_id':new ObjectId(),
                            member_name:req.body.user_name,
                            member_photo:'',
                            member_email:req.body.emailid,
                            member_role:'Project Admin',
                            member_designation:'',
                            member_organization:''
                        }]
                    }]
                    var project=new Thogupu.Project({
                        '_id':prjtId,
                        project_name:'General',
                        project_id:'Not Applicable',
                        project_status:'save',
                        created_by:req.body.emailid,
                        created_date:new Date(),
                        app_info:appInfo,
                        organization_info:org_info
                    });
                    project.save(function(err) {
                        if (err) {
                            return res.status(500).json({
                                title: 'An error occurred',
                                error: err
                            })
                        } 
                        else 
                        {
                            var token = jwt.sign({ uid: data._id,uname: req.body.user_name, uemail: req.body.emailid,uorg:req.body.org_name }, secret_key, { expiresIn: 86400 });
                            res.status(201).json({
                                msg:'saved',
                                token,
                                prjtId
                            });
                        }
                    })
                });
            }
        });
    });
});

router.get('/thogupu/addproject/:umail', (req, res, next) => {
    Thogupu.User.findOne({ email_id: req.params.umail }, function(err, user) {
        Thogupu.Project.deleteMany({project_name: { $eq: null }}, function (err, _) {
            if (err) {
                return console.log(err);
            }
            Thogupu.App.find({}, (err, apps) => {
                var appInfo=[];
                apps.forEach(function(item){
                    appInfo.push({
                        '_id':new ObjectId(),
                        app_name:item.app_name,
                        app_logo:item.app_logo,
                        app_desc:item.app_desc,
                        app_price:item.app_price,
                        total_member:item.total_member,
                        app_url:item.app_url,
                        app_status:'Inactive'
                    });
                });

                var prjtId=new ObjectId();
                
                var org_info=[{
                    '_id':new ObjectId(),
                    organization_name:user.organization_name,
                    organization_role:user.organization_role,
                    organization_logo:'',
                    member_info:[{
                        '_id':new ObjectId(),
                        member_name:user.user_name,
                        member_photo:'',
                        member_email:user.email_id,
                        member_role:'Project Admin',
                        member_designation:user.functional_role,
                        member_organization:user.organization_name
                    }]
                }]
                var project=new Thogupu.Project({
                    '_id':prjtId,
                    created_by:req.params.umail,
                    project_status:'draft',
                    app_info:appInfo,
                    organization_info:org_info
                });
                project.save(function(err) {
                    if (err) {
                        return res.status(500).json({
                            title: 'An error occurred',
                            error: err
                        })
                    } 
                    else 
                    {
                        res.status(200).json({
                            status: 'success',
                            prjtId:prjtId,
                            project_name: '',
                            project_address: '',
                            project_country: '',
                            project_state: '',
                            project_city: '',
                            project_zipcode: '',
                            project_category: '',
                            projectarea_sqft: '',
                            projectarea_sqmt: '',
                            project_type: '',
                            project_subtype: '',
                            service_info: [],
                            organization_info: org_info
                        })
                    }
                });
            });   
        });
    });
});
/* 
router.get('/thogupu/addproject/:pid', (req, res, next) => {

    Thogupu.Project.deleteMany({project_name: { $eq: null }}, function (err, _) {
        if (err) {
            return console.log(err);
        }
        Thogupu.Project.findById(ObjectId(req.params.pid),function(err, data){ 
            Thogupu.App.find({}, (err, apps) => {
                var appInfo=[];
                apps.forEach(function(item){
                    appInfo.push({
                        '_id':new ObjectId(),
                        app_name:item.app_name,
                        app_logo:item.app_logo,
                        app_desc:item.app_desc,
                        app_price:item.app_price,
                        total_member:item.total_member,
                        app_url:item.app_url,
                        app_status:'Inactive'
                    });
                });

                var prjtId=new ObjectId();
                var project=new Thogupu.Project({
                    '_id':prjtId,
                    email_id:data.email_id,
                    user_name: data.user_name,
                    organization_name: data.organization_name,
                    organization_role: data.organization_role,
                    user_address: data.user_address,
                    user_country:data.user_country,
                    user_state:data.user_state,
                    user_city: data.user_city,
                    user_zipcode: data.user_zipcode,
                    stack_holder: data.stack_holder,
                    functional_role: data.functional_role,
                    contact_no: data.contact_no,
                    project_status:'draft',
                    app_info:appInfo,
                    organization_info:[{
                        '_id':new ObjectId(),
                        organization_name:data.organization_name,
                        organization_role:data.organization_role,
                        organization_logo:'',
                        member_info:[{
                            '_id':new ObjectId(),
                            member_name:data.user_name,
                            member_photo:'',
                            member_email:data.email_id,
                            member_role:'Project Admin',
                            member_designation:data.functional_role,
                            member_organization:data.organization_name
                        }]
                    }]
                });
                project.save(function(err) {
                    if (err) {
                        return res.status(500).json({
                            title: 'An error occurred',
                            error: err
                        })
                    } 
                    else 
                    {
                        res.status(200).json({
                            status: 'success',
                            prjtId:prjtId
                        })
                    }
                });
            });
        });
    });
}); */

router.get('/adduser/:bulkquery',jwtAuth, function (req, res ) {      
    var input = JSON.parse(req.params.bulkquery);
    if(input.status=='add')
    {
        Thogupu.User.findOne({email_id: input.email_id}, function(err, data) {
            if(data==null)
            {
                const details = new Thogupu.User({
                    user_name:input.user_name,
                    email_id:input.email_id, 
                    organization_name:input.organization_name,
                    phone_no:input.mobile_no, 
                    role_name:input.service_selected,
                    designation_name:input.account_selected,
                    user_status:'draft',
                    super_admin:req.userEmail
                });
                details.save(function(err, result) { 
                    if (err) {
                        return res.status(500).json({
                            title: 'An error occurred',
                            error: err
                        });
                    }
                    else 
                    {
                        Thogupu.User.aggregate([
                            { $match: {$or:[{ organization_name:req.userOrg },{ super_admin:req.userEmail }]} },
                            {
                                $group:
                                {
                                    _id: {'_id':'$_id','user_name':'$user_name','email_id':'$email_id','designation_name':'$designation_name','role_name':'$role_name','organization_name':'$organization_name','profile_path':'$profile_path'}   
                                }
                            },
                            {
                                $project:
                                {
                                    _id:'$_id._id',
                                    user_name:'$_id.user_name',
                                    email_id:'$_id.email_id',
                                    designation_name:'$_id.designation_name',
                                    role_name:'$_id.role_name',
                                    organization_name:'$_id.organization_name',
                                    profile_path:'$_id.profile_path'
                                }
                            },
                            {
                                $sort : {"_id" : 1}
                            }
                        ],
                        function (err, result) {
                            if (err) {
                                next(err);
                            } 
                            else 
                            {
                                res.status(200).json({
                                    status: 'success',
                                    userList:result
                                })
                            }
                        })
                    }
                });
            }
            else
            {
                res.status(200).json({
                    status: 'exist'
                })
            }
        });
    }
    else if(input.status=='edit')
    {
        Thogupu.User.findById(ObjectId(input.user_id),function(err, data){ 
            data.user_name=input.user_name;
            data.email_id=input.email_id;
            data.organization_name=input.organization_name;
            data.phone_no=input.mobile_no;
            data.role_name=input.service_selected;
            data.designation_name=input.account_selected;
            data.save(function(err) {
                if (err) {
                    return res.status(500).json({
                        title: 'An error occurred',
                        error: err
                    })
                } 
                else 
                {
                    Thogupu.User.aggregate([
                        { $match: {$or:[{ organization_name:req.userOrg },{ super_admin:req.userEmail }]} },
                        {
                            $group:
                            {
                                _id: {'_id':'$_id','user_name':'$user_name','email_id':'$email_id','designation_name':'$designation_name','role_name':'$role_name','organization_name':'$organization_name','profile_path':'$profile_path'}   
                            }
                        },
                        {
                            $project:
                            {
                                _id:'$_id._id',
                                user_name:'$_id.user_name',
                                email_id:'$_id.email_id',
                                designation_name:'$_id.designation_name',
                                role_name:'$_id.role_name',
                                organization_name:'$_id.organization_name',
                                profile_path:'$_id.profile_path'
                            }
                        },
                        {
                            $sort : {"_id" : 1}
                        }
                    ],
                    function (err, result) {
                        if (err) {
                            next(err);
                        } 
                        else 
                        {
                            res.status(200).json({
                                status: 'success',
                                userList:result
                            })
                        }
                    })
                }
            });
        });
    }
});

router.get('/user/getuserinfo',jwtAuth, function (req, res, next) {

    Thogupu.User.aggregate([
        { $match: {$or:[{ organization_name:req.userOrg },{ super_admin:req.userEmail }]} },
        {
            $group:
            {
                _id: {'_id':'$_id','user_name':'$user_name','email_id':'$email_id','designation_name':'$designation_name','organization_name':'$organization_name','profile_path':'$profile_path'}   
            }
        },
        {
            $project:
            {
                _id:'$_id._id',
                user_name:'$_id.user_name',
                email_id:'$_id.email_id',
                designation_name:'$_id.designation_name',
                organization_name:'$_id.organization_name',
                profile_path:'$_id.profile_path'
            }
        },
        {
            $sort : {"_id" : 1}
        }
    ],
    function (err, result) {
        if (err) {
            next(err);
        } 
        else 
        {
            res.json(result)
        }
    })
});



router.get('/user/removeuser/:uid',jwtAuth,  function (req, res, next) {
    Thogupu.User.remove({'_id': (req.params.uid)},function (err, result1) {
        Thogupu.User.aggregate([
            { $match: {$or:[{ organization_name:req.userOrg },{ super_admin:req.userEmail }]} },
            {
                $group:
                {
                    _id: {'_id':'$_id','user_name':'$user_name','email_id':'$email_id','designation_name':'$designation_name','role_name':'$role_name','organization_name':'$organization_name','profile_path':'$profile_path'}   
                }
            },
            {
                $project:
                {
                    _id:'$_id._id',
                    user_name:'$_id.user_name',
                    email_id:'$_id.email_id',
                    designation_name:'$_id.designation_name',
                    role_name:'$_id.role_name',
                    organization_name:'$_id.organization_name',
                    profile_path:'$_id.profile_path'
                }
            },
            {
                $sort : {"_id" : 1}
            }
        ],
        function (err, result) {
            if (err) {
                next(err);
            } 
            else 
            {
                res.json(result)
            }
        }
        );
    });
});

router.post('/thogupu/openapp', (req, res, next) => {
    var loginId=new ObjectId();
   
    let appToken = new Thogupu.Applogin({
        '_id':loginId,
        token_value:req.body.token
    });
    appToken.save(function (err,result) {
        if (err) {
            return res.status(500).json({
                title: 'An error occurred',
                error: err
            });
        }
        else
        {
            res.json(loginId);
        }
    });
});

router.get('/thogupu/checkloginid/:lid/:umail', (req, res, next) => {
    Thogupu.Applogin.findOne({_id: ObjectId(req.params.lid)}, function(err, data) {
        if(data==null)
        {
            res.status(201).json({
                msg:'invalid'
            });
        }
        else
        {
            var token=data.token_value;
            Thogupu.Applogin.deleteOne({_id: ObjectId(req.params.lid)}, function(result) {
                var aggregateArray=[];
                
                aggregateArray.push({ $match:{$and:[{project_status:'save'},{project_name: { $ne: null }}]}});
                aggregateArray.push(
                    { $unwind :  "$organization_info" },
                    { $unwind :  "$organization_info.member_info" },
                    { $match : {'organization_info.member_info.member_email' : req.params.umail }}
                );
                
                aggregateArray.push({
                    $group:
                    {
                        _id: {'_id':'$_id','project_name':'$project_name','project_id':'$project_id'}   
                    }
                    },
                    {
                        $project:
                        {
                            _id:'$_id._id',
                            project_name:'$_id.project_name',
                            project_id:'$_id.project_id'
                        }
                    },
                    { 
                        $sort : { "_id" : -1}
                    }
                );
                Thogupu.Project.aggregate(aggregateArray, function (err, result) {
                    if (err) {
                        next(err);
                    } 
                    else 
                    {
                        Thogupu.Vertical.find({}, (err, results) => {
                            res.status(201).json({
                                msg:'success',
                                token:token,
                                projectsList:result,
                                verticalList:results
                            });
                        });
                    }
                });
            });
        }
    });
});

router.get('/thogupu/checkenthiranloginid/:lid/:umail', (req, res, next) => {
    Thogupu.Applogin.findOne({_id: ObjectId(req.params.lid)}, function(err, data) {
        if(data==null)
        {
            res.status(201).json({
                msg:'invalid'
            });
        }
        else
        {
            var token=data.token_value;
            Thogupu.Applogin.deleteOne({_id: ObjectId(req.params.lid)}, function(result) {
                var aggregateArray=[];
                
                aggregateArray.push(
                    { $unwind :  "$team_info" },
                    { $match : {'team_info.email_id' : req.params.umail }}
                ); 
                aggregateArray.push({
                    $group:
                    {
                        _id:{'_id':'$_id','project_name':'$project_name','project_status':'$project_status','user_role':'$team_info.user_role','manager_info':'$manager_info','leader_info':'$leader_info','engineers_info':'$engineers_info'}
                    }
                    },
                    {
                        $project:
                        {
                            _id:'$_id._id',
                            project_name:'$_id.project_name',
                            project_status:'$_id.project_status',
                            user_role:'$_id.user_role',
                            manager_info:'$_id.manager_info',
                            leader_info:'$_id.leader_info',
                            engineers_info:'$_id.engineers_info'
                        }
                    },
                    { 
                        $sort : { "_id" : -1}
                    }
                );
                Enthiran.Project.aggregate(aggregateArray, function (err, result) {
                    if (err) {
                        next(err);
                    } 
                    else 
                    {
                        res.status(201).json({
                            msg:'success',
                            token:token,
                            projectsList:result
                        });
                    }
                });
            });
        }
    });
});

router.get('/thogupu/enthiranprojects/:umail', (req, res, next) => {
    
    var aggregateArray=[];
   
    aggregateArray.push(
        { $unwind :  "$team_info" },
        { $match : {'team_info.email_id' : req.params.umail }}
    ); 
    aggregateArray.push({
        $group:
        {
            _id:{'_id':'$_id','project_name':'$project_name','project_status':'$project_status','user_role':'$team_info.user_role','manager_info':'$manager_info','leader_info':'$leader_info','engineers_info':'$engineers_info'}
        }
        },
        {
            $project:
            {
                _id:'$_id._id',
                project_name:'$_id.project_name',
                project_status:'$_id.project_status',
                user_role:'$_id.user_role',
                manager_info:'$_id.manager_info',
                leader_info:'$_id.leader_info',
                engineers_info:'$_id.engineers_info'
            }
        },
        { 
            $sort : { "_id" : -1}
        }
    );
    Enthiran.Project.aggregate(aggregateArray, function (err, result) {
        if (err) {
            next(err);
        } 
        else 
        {
            res.status(201).json({
                msg:'success',
                projectsList:result
            });
        }
    });    
});

router.get('/thogupu/checkinakkamlogin/:lid', (req, res, next) => {
    Thogupu.Applogin.findOne({_id: ObjectId(req.params.lid)}, function(err, data) {

        if(data==null)
        {
            res.status(201).json({
                msg:'invalid'
            });
        }
        else
        {
            var token=data.token_value;
            var pid=data.project_id;

            Thogupu.Applogin.deleteOne({_id: ObjectId(req.params.lid)}, function(result) {
                res.status(201).json({
                    msg:'success',
                    token:token,
                    pid:pid
                });
            });
        }
    });
});

router.get('/thogupu/inakkamprojects/:umail', (req, res, next) => {

    var aggregateArray=[];

    
    aggregateArray.push({ $match:{$and:[{project_status:'save'},{project_name: { $ne: null }}]}});
    aggregateArray.push(
        { $unwind :  "$organization_info" },
        { $unwind :  "$organization_info.member_info" },
        { $match : {'organization_info.member_info.member_email' : req.params.umail }}
    );

    aggregateArray.push({
        $group:
        {
            _id: {'_id':'$_id','project_name':'$project_name','project_id':'$project_id'}   
        }
        },
        {
            $project:
            {
                _id:'$_id._id',
                project_name:'$_id.project_name',
                project_id:'$_id.project_id'
            }
        },
        { 
            $sort : { "_id" : -1}
        }
    );
    Thogupu.Project.aggregate(aggregateArray, function (err, result) {
        if (err) {
            next(err);
        } 
        else 
        {
            Thogupu.Vertical.find({}, (err, results) => {
                res.status(201).json({
                    msg:'success',
                    projectsList:result,
                    verticalList:results
                });
            });
        }
    });
            
});

router.get('/thogupu/getverticals', (req, res, next) => {
    Thogupu.Vertical.find({}, (err, results) => {
        res.json(results);
    });
});

router.get('/thogupu/showproject/:pid', (req, res, next) => {
    Thogupu.Project.findById(ObjectId(req.params.pid),function(err, data){ 
        var allApplication=[];
        var singleApplication=[];
        var yourApplication=[];
        var memberInfo=[];
        data.organization_info.forEach(function(item){
            item.member_info.forEach(function(item1){
                memberInfo.push({
                    member_name:item1.member_name,
                    member_email:item1.member_email,
                    member_designation:item1.member_designation,
                    member_organization:item1.member_organization
                });
            });
        });

        data.app_info.forEach(function(item){
            
            if(item.app_status=='Inactive' && item.app_name!='All Apps')
            {
                singleApplication.push({
                    _id:item._id,
                    app_name : item.app_name,
                    app_logo : item.app_logo,
                    app_desc : item.app_desc,
                    app_price : item.app_price,
                    total_member : item.total_member,
                    app_status:item.app_status
                });
            }
            else if(item.app_status=='Inactive' && item.app_name=='All Apps')
            {
                allApplication.push({
                    _id:item._id,
                    app_name : item.app_name,
                    app_logo : item.app_logo,
                    app_desc : item.app_desc,
                    app_price : item.app_price,
                    total_member : item.total_member,
                    app_status:item.app_status
                });
            }
            else if(item.app_status=='Active' && item.app_name!='All Apps')
            {
                yourApplication.push({
                    _id:item._id,
                    app_name : item.app_name,
                    app_logo : item.app_logo,
                    app_desc : item.app_desc,
                    app_price : item.app_price,
                    total_member : item.total_member,
                    app_status:item.app_status
                });
            }
        });
        Enthiran.Project.findOne({project_id: data.project_id }, function(err, data1) {
            var client_name='';
            var architect_name='';
            var drawing_filepath='';
            var systems=[];
            var items=[];
            var mcatgs=[];
            var scatgs=[];
            var codes=[];
            if(data1!=null)
            {
                client_name=data1.client_name;
                architect_name=data1.architect_name;
                drawing_filepath=data1.drawing_filepath;
                var r=data1.revision_info[data1.revision_info.length-1];
                
                r.project_systems.forEach(function(item){
                    systems.push(item.system_name)
                });
                r.project_items.forEach(function(item){
                    items.push(item.item_name)
                });
                r.project_main_category.forEach(function(item){
                    mcatgs.push(item.main_category_name)
                });
                r.project_sub_category.forEach(function(item){
                    scatgs.push(item.sub_category_name)
                });
                r.project_codes.forEach(function(item){
                    codes.push(item.code_name)
                });
            }

            res.status(201).json({
                project_id:data.project_id,
                building_info:data.building_info,
                allApplication:allApplication,
                singleApplication:singleApplication,
                yourApplication:yourApplication,
                project_country:data.project_country,
                project_state:data.project_state,
                project_city:data.project_city,
                project_zipcode:data.project_zipcode,
                projectarea_sqft:data.projectarea_sqft,
                projectarea_sqmt:data.projectarea_sqmt,
                project_type:data.project_type,
                project_subtype:data.project_subtype,
                service_info:data.service_info,
                building_info:data.building_info,
                client_name:client_name,
                architect_name:architect_name,
                drawing_filepath:drawing_filepath,
                project_systems:systems,
                project_items:items,
                project_main_category:mcatgs,
                project_sub_category:scatgs,
                project_codes:codes,
                memberInfo:memberInfo
            });
        });
    });
});

router.post('/thogupu/savebuildingdata/:pid', (req, res, next) => {
    var buildingData=req.body;
    var buidlingInfo=[];
    Thogupu.Project.findById(ObjectId(req.params.pid),function(err, data){ 

        buildingData.forEach(function(b){
            var floorInfo=[];
            b.floor_info.forEach(function(f){
                floorInfo.push({
                    '_id':new ObjectId(),
                    floor_name:f.floor_name,
                    floor_status:f.floor_status
                });
            });
            buidlingInfo.push({
                '_id':new ObjectId(),
                building_id:b.building_id,
                building_name:b.building_name,
                no_floor:b.no_floor,
                above_grade:b.above_grade,
                below_grade:b.below_grade,
                working_floors:b.working_floors,
                floor_info:floorInfo
            });
            floorInfo=[];
        });
        data.building_info=buidlingInfo;
        data.save(function(err) {
            if (err) {
                return res.status(500).json({
                    title: 'An error occurred',
                    error: err
                })
            } 
            else 
            {
                res.status(201).json({
                    msg:'saved'
                });
            }
        });
    });
});


router.get('/thogupu/updateexcel/:pid', (req, res, next) => {
    const fs = require('fs');
    var path=require('path');
    Thogupu.Project.findById(ObjectId(req.params.pid),function(err, data){ 
        // File destination.txt will be created or overwritten by default.
        fs.copyFile(path.resolve(__dirname, '../public/masterexcel/master.xlsx'), path.resolve(__dirname, '../public/masterexcel/slave.xlsx'), (err) => {
            if (err) throw err;
            const ExcelJS = require('exceljs');
            const workbook = new ExcelJS.Workbook();
            const fileName = path.resolve(__dirname, '../public/masterexcel/slave.xlsx');
            (async function () {
                // Read file and Sheet 1
                const worksheet = (await workbook.xlsx.readFile(fileName)).getWorksheet('Master');
                
                var colstring=65; 
                data.building_info.forEach(function(b){
                    var rowno=1;
                    rowcol=String.fromCharCode(colstring)+rowno;
                    worksheet.getCell(rowcol).value = b.building_name;
                    rowno++;
                    b.floor_info.forEach(function(f){
                        rowcol=String.fromCharCode(colstring)+rowno;
                        worksheet.getCell(rowcol).value = f.floor_name;
                        rowno++;
                    });
                    colstring++;
                });
                
                // Write to same file
                try {
                    await workbook.xlsx.writeFile(fileName);
                    res.json('saved');
                } catch (error) {
                    console.log('Write file fails: ', error);
                }
            })();
        });
    });
});


router.get('/thogupu/getProjectId/:user_email',function(req, res, next){
    var aggregateArray=[];

    aggregateArray.push({ $match:{project_status:'save'}});
    aggregateArray.push(
        { $unwind :  "$organization_info" },
        { $unwind :  "$organization_info.member_info" },
        { $match : {'organization_info.member_info.member_email' : req.params.user_email }}
    );

    aggregateArray.push({
        $group:
        {
            _id: {'_id':'$_id','project_name':'$project_name','project_id':'$project_id'}   
        }
        },
        {
            $project:
            {
                _id:'$_id._id',
                project_name:'$_id.project_name',
                project_id:'$_id.project_id'
            }
        },
        { 
            $sort : { "_id" : -1}
        }
    );
    Thogupu.Project.aggregate(aggregateArray, function (err, result) {
        if (err) {
            next(err);
        } 
        else 
        {
            if(result.length>0)
            {
                res.json({
                    projId:result[0]._id
                });
            }
            else
            {
                res.json({
                    projId:''
                });
            }
        }
    });
});

router.post('/thogupu/registerloginid',(req,res,next)=>{
    Thogupu.Project.findById(ObjectId(req.body.pid),async function(err, data){ 

        switch(req.body.appname)
        {
            case 'VAV Sizing Selection':
                var projectExist = await VAV.Project.findOne({ _id: ObjectId(req.body.pid) });
                if(projectExist==null)
                {
                    var project=new VAV.Project({
                        '_id':new ObjectId(req.body.pid),
                        project_id : data.project_id,
                        project_name : data.project_name,
                        input_unit : "IP",
                        output_unit : "",
                        airflow_unit : "CFM",
                        inletpressure_unit : "in WC",
                        pressuredrop_unit : "mm WC",
                        vavsize_unit : "mm",
                        casing_unit : "mm",
                        insulation_unit : "inch",
                        weight_unit : "kg",
                        power_unit : "Watts",
                        noise_unit : "NC",
                        total_vav : 0,
                        building_info : [ ]
                    });
                    project.save();
                }
            break;
            case 'Air Terminal Selection':
                var projectExist = await ATS.Project.findOne({ _id: ObjectId(req.body.pid) });
                if(projectExist==null)
                {
                    var project=new ATS.Project({
                        '_id':new ObjectId(req.body.pid),
                        project_id : data.project_id,
                        project_name : data.project_name,
                        total_diffuser:0,
                        building_info:[],
                        dimension_ipunit: "meter",
                        waterdemand_ipunit: "m3/day",
                        capacity_opunit: "m3",
                        dimension_opunit: "meter"
                    });
                    project.save();
                }
            break;
            case 'Water Storage Calculation':
                var projectExist = await WSC.Project.findOne({ _id: ObjectId(req.body.pid) });
                if(projectExist==null)
                {
                    var project=new WSC.Project({
                        '_id':new ObjectId(req.body.pid),
                        project_id : data.project_id,
                        project_name : data.project_name,
                        building_info:[],
                        landscapinginput_unit: "mm²",
                        wdinput_unit: "KL/Day",
                        wdoutput_unit: "ft³/day"
                    });
                    project.save();
                }
            break
            case 'Water Demand Calculation':
                var projectExist = await WDC.Project.findOne({ _id: ObjectId(req.body.pid) });
                if(projectExist==null)
                {
                    var project=new WDC.Project({
                        '_id':new ObjectId(req.body.pid),
                        project_id : data.project_id,
                        project_name : data.project_name,
                        building_info:[]
                    });
                    project.save();
                }
            break
            case 'Toilet Fixture Calculation':
                var projectExist = await TFC.Project.findOne({ _id: ObjectId(req.body.pid) });
                if(projectExist==null)
                {
                    var project=new TFC.Project({
                        '_id':new ObjectId(req.body.pid),
                        project_id : data.project_id,
                        project_name : data.project_name,
                        building_info:[]
                    });
                    project.save();
                }
            break
            case 'UPS Selection':
                var projectExist = await UPS.Project.findOne({ _id: ObjectId(req.body.pid) });
                if(projectExist==null)
                {
                    var project=new UPS.Project({
                        '_id':new ObjectId(req.body.pid),
                        project_id : data.project_id,
                        project_name : data.project_name,
                        building_info:[]
                    });
                    project.save();
                }
            break
        }
        var loginId=new ObjectId();
        let appToken = new Thogupu.Applogin({
            '_id':loginId,
            project_id:req.body.pid,
            token_value:req.body.token
        });
        appToken.save(function (err,result) {
            
            if (err) {
                return res.status(500).json({
                    title: 'An error occurred',
                    error: err
                });
            }
            else
            {
                res.json(loginId);
            }
        });
    });
});

// header_modelbox_start

router.post("/feedbackprofile/:umail",function(req, res) {
    var multer = require('multer');
    var fs= require('fs');
    var img_url="";
    var img_name='';
    var imgicon = multer.diskStorage({
        destination: function(req, file, callback) {
            if (!fs.existsSync('public/feedback/'+req.params.umail))
            {
                fs.mkdirSync('public/feedback/'+req.params.umail);   
            }
            else
            {
                var testFolder = 'public/feedback/'+req.params.umail; 
                fs.readdirSync(testFolder).forEach(file => {
                    fs.unlinkSync(testFolder+'/'+file);
                })
            }
            callback(null,'public/feedback/'+req.params.umail);
        },
        filename: function(req, file, callback) {
            callback(null, file.originalname);
            img_url='feedback/'+req.params.umail+'/'+file.originalname;
            img_name=file.originalname;
        }
    });
 
    var itemupload = multer({ storage: imgicon }).single('uploads');

    itemupload(req, res, function(err) {
        if (err) {
            return res.send({ status: 'Error uploading file' });
        }
        else
        {
            res.send({ url: img_url,img_name:img_name});
        }
    });
});


router.get('/thogupu/starRating/:starrating', (req, res) => {
    var input = JSON.parse(req.params.starrating);
    const details = new Thogupu.Rating({ 
        user_email:input.user_email,
        feedback_ques1:input.radio_ques1,
        others_ques1:input.txt_ques1,
        feedback_ques2:input.ques2_rate,
        feedback_ques3:input.radio_ques3,
        others_ques3:input.txt_ques3,
        feedback_ques4:input.ques4_rate,
        feedback_ques5:input.ques5_rate,
        feedback_ques6:input.ques6_rate,
        feedback_ques7:input.ques7_rate,
        feedback_ques8:input.radio_ques8,
        others_ques8:input.txt_ques8,
        feedback_ques9:input.ques9_rate,
        feedback_ques10:input.ques10_rate,
        feedback_ques11:input.ques11_rate,
        feedback_desc:input.feedback_desc,
        file_path:input.profile_names,
        feedback_from:input.feedback_from,
        created_date: new Date()
    });
    details.save(function(err, result) { 
        if (err) {
            return res.status(500).json({
                title: 'An error occurred',
                error: err
            });
        }
        else
        {

            res.json('saved');
            let mailOptions = {
                from: '"JupiterBrothers" <contact@jupiterbrothers.com>', // sender address
                to:input.user_email, // list of receivers
                //to: req.body.email,
                subject: input.feedback_from,
                text: 'Authentication', // plain text body
                html: '<div> <div style="width: 600px;"> <div style="text-align:center;padding-top: 10px;"> <img src="cid:thogupulogo@thogupu.com"> </div> <div style="padding-top: 20px;"> <div style="background-color: #FAFBFF;padding: 10px 20px 50px 20px;"> <div style="font-weight: 700;font-size: 30px;text-align: center;margin-top: 50px;">We Received your Feedback!</div> <div style="text-align: center;font-size: 16px;font-weight: 400;margin-top: 10px;">Thanks for Contacting us. We will get back to you shortly.</div> <div style="text-align: center;font-size: 16px;font-weight: 400;margin-top: 5px;"> Have a great day.</div> <div style="text-align: center;padding-top: 50px;">  <img src="cid:feedback@thogupu.com"> </div> </div> </div> <div style="text-align: center;padding-top:60px;"> <img src="cid:jblogo@thogupu.com"> </div> <div style="font-size: 12px;text-align: center;padding-top: 10px;">If you have any questions, feel free to message us at contact@jupiterbrothers.com</div> <div style="font-size: 12px;text-align: center;padding-top: 10px;font-weight: 700;">Maraneri, Sivakasi, Tamil Nadu, India</div> <div style="display: flex;text-align: center;padding: 10px 0px 0px 223px;"> <a href="https://www.linkedin.com/mwlite/company/jupiterbrothers"> <img src="cid:linkedin@thogupu.com"> </a> <a href="https://m.facebook.com/innovationforaec/?locale2=en_US" style="padding-left: 14px;"> <img src="cid:facebook@thogupu.com"> </a> <a href="https://instagram.com/jupiter.brothers?utm_medium=copy_link" style="padding-left: 14px;"><img src="cid:instagram@thogupu.com"> </a> <a href="https://twitter.com/jupiterbrothers" style="padding-left: 14px;"> <img src="cid:twitter@thogupu.com"> </a> <a href="https://www.youtube.com/channel/UCn83bZm06GeV8r3OBjKYZ4Q/featured" style="padding-left: 14px;"> <img src="cid:youtube@thogupu.com"> </a> </div> <div style="text-align: center;font-size: 12px;padding-top: 10px;">Terms of use | Privacy Policy</div> <div style="padding-top: 10px;"> <div style="background-color: #DB053D;color: white;font-size: 12px;text-align: center;padding: 5px 0px 5px 0px;">All rights reserved © Jupiter Brothers Data Center Pvt. Ltd.,</div> </div> </div> </div>', // html body
                attachments: [{
                    filename: 'thogupulogo.png',
                    path: 'https://backend.thogupu.com/thogupumail/thogupulogo.png',
                    cid: 'thogupulogo@thogupu.com' 
                },{
                    filename: 'jblogo.png',
                    path: 'https://backend.thogupu.com/thogupumail/jblogo.png',
                    cid: 'jblogo@thogupu.com' 
                },{
                    filename: 'facebook.png',
                    path: 'https://backend.thogupu.com/thogupumail/facebook.png',
                    cid: 'facebook@thogupu.com' 
                },{
                    filename: 'instagram.png',
                    path: 'https://backend.thogupu.com/thogupumail/instagram.png',
                    cid: 'instagram@thogupu.com' 
                },{
                    filename: 'linkedin.png',
                    path: 'https://backend.thogupu.com/thogupumail/linkedin.png',
                    cid: 'linkedin@thogupu.com' 
                },{
                    filename: 'security.png',
                    path: 'https://backend.thogupu.com/thogupumail/security.png',
                    cid: 'feedback@thogupu.com' 
                },{
                    filename: 'twitter.png',
                    path: 'https://backend.thogupu.com/thogupumail/twitter.png',
                    cid: 'twitter@thogupu.com' 
                },{
                    filename: 'youtube.png',
                    path: 'https://backend.thogupu.com/thogupumail/youtube.png',
                    cid: 'youtube@thogupu.com' 
                }]
            };
    
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    return console.log(error);
                }
                console.log('Message %s sent: %s', info.messageId, info.response);
                res.json('saved');
            });
        }
    });
});

router.get('/api/helpmessage/:bulkquery', function (req, res, next){

    var input=JSON.parse(req.params.bulkquery);
    var ticket_number=Math.floor(Math.random()*90000) + 10000;
    // console.log(ticket_number);
    
    const small = new Thogupu.Help({ 
        user_email:input.user_email,
        help_desc:input.help_desc,
        file_path:input.profile_name,
        ticket_number:ticket_number,
        help_from:input.help_from,
        created_date:new Date(),
    });
    
    small.save(function(err, result) { 
        if (err) {
            return res.status(500).json({
                title: 'An error occurred',
                error: err
            });
        }
        else
        {

            res.json('saved');
            let mailOptions = {
                from: '"JupiterBrothers" <contact@jupiterbrothers.com>', // sender address
                to:input.user_email, // list of receivers
                //to: req.body.email,                
                subject: input.help_from,
                text: 'Authentication', // plain text body
                html: '<div> <div style="width: 600px;"> <div style="text-align:center;padding-top: 10px;"> <img src="cid:thogupulogo@thogupu.com"> </div> <div style="padding-top: 20px;"> <div style="background-color: #FAFBFF;padding: 10px 20px 50px 20px;"> <div style="text-align: center;font-size: 30px;font-weight: 700;margin-top: 50px;">Help Desk</div> <div style="font-size: 20px;font-weight: 700;text-align: center;margin-top: 10px;">We hear you!</div> <div style="font-size: 16px;font-weight: 400;text-align: center;margin-top: 15px;">Thanks for raising an issue with us. We always strive to make sure that our</div> <div style="font-size: 16px;font-weight: 400;text-align: center;margin-top: 3px;">Application works smoothly without any flaws, and we are pleased to see</div> <div style="font-size: 16px;font-weight: 400;text-align: center;margin-top: 3px;">you actively helping us make our Application more user-friendly.</div> <div style="text-align: center;padding-top: 50px;"> <img src="cid:security@thogupu.com"> </div> <div style="padding: 40px 50px 0px 120px;text-align: center;"> <div style="background-color: #024580;width: 280px; padding: 14px 0px;border-radius: 8px;color: white;font-weight: 700;font-size: 16px;">Your Ticket Number: '+ticket_number+'</div> <div style="font-size: 10px;clear: both;padding: 0px 115px 0px 0px;">We will get back to you within 48 hours.</div> </div> </div> </div> <div style="text-align: center;padding-top: 15px;"> <img src="cid:jblogo@thogupu.com"> </div> <div style="font-size: 12px;text-align: center;padding-top: 10px;">If you have any questions, feel free to message us at contact@jupiterbrothers.com</div> <div style="font-size: 12px;text-align: center;padding-top: 10px;font-weight: 700;">Maraneri, Sivakasi, Tamil Nadu, India</div> <div style="display: flex;text-align: center;padding: 10px 0px 0px 223px;"> <a href="https://www.linkedin.com/mwlite/company/jupiterbrothers"> <img src="cid:linkedin@thogupu.com"> </a> <a href="https://m.facebook.com/innovationforaec/?locale2=en_US" style="padding-left: 14px;"> <img src="cid:facebook@thogupu.com"> </a> <a href="https://instagram.com/jupiter.brothers?utm_medium=copy_link" style="padding-left: 14px;"> <img src="cid:instagram@thogupu.com"> </a> <a href="https://twitter.com/jupiterbrothers" style="padding-left: 14px;"> <img src="cid:twitter@thogupu.com"> </a> <a href="https://www.youtube.com/channel/UCn83bZm06GeV8r3OBjKYZ4Q/featured" style="padding-left: 14px;"> <img src="cid:youtube@thogupu.com"> </a> </div> <div style="text-align: center;font-size: 12px;padding-top: 10px;">Terms of use | Privacy Policy</div> <div style="padding-top: 10px;"> <div style="background-color: #DB053D;color: white;font-size: 12px;text-align: center;padding: 5px 0px 5px 0px;">All rights reserved © Jupiter Brothers Data Center Pvt. Ltd.,</div> </div> </div> </div>', // html body
                attachments: [{
                    filename: 'thogupulogo.png',
                    path: 'https://backend.thogupu.com/thogupumail/thogupulogo.png',
                    cid: 'thogupulogo@thogupu.com' 
                },{
                    filename: 'jblogo.png',
                    path: 'https://backend.thogupu.com/thogupumail/jblogo.png',
                    cid: 'jblogo@thogupu.com' 
                },{
                    filename: 'facebook.png',
                    path: 'https://backend.thogupu.com/thogupumail/facebook.png',
                    cid: 'facebook@thogupu.com' 
                },{
                    filename: 'instagram.png',
                    path: 'https://backend.thogupu.com/thogupumail/instagram.png',
                    cid: 'instagram@thogupu.com' 
                },{
                    filename: 'linkedin.png',
                    path: 'https://backend.thogupu.com/thogupumail/linkedin.png',
                    cid: 'linkedin@thogupu.com' 
                },{
                    filename: 'security.png',
                    path: 'https://backend.thogupu.com/thogupumail/security.png',
                    cid: 'security@thogupu.com' 
                },{
                    filename: 'twitter.png',
                    path: 'https://backend.thogupu.com/thogupumail/twitter.png',
                    cid: 'twitter@thogupu.com' 
                },{
                    filename: 'youtube.png',
                    path: 'https://backend.thogupu.com/thogupumail/youtube.png',
                    cid: 'youtube@thogupu.com' 
                }]
            };
    
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    return console.log(error);
                }
                console.log('Message %s sent: %s', info.messageId, info.response);
                res.json('saved');
            });
        }
    });
});

router.post("/helpupload/:umail", function(req, res) {
    var multer = require('multer');
    var fs= require('fs');
    var img_url="";
    var img_name='';
    var imgicon = multer.diskStorage({
        destination: function(req, file, callback) {
            if (!fs.existsSync('public/help/'+req.params.umail))
            {
                fs.mkdirSync('public/help/'+req.params.umail);   
            }
            else
            {
                var testFolder = 'public/help/'+req.params.umail; 
                fs.readdirSync(testFolder).forEach(file => {
                    fs.unlinkSync(testFolder+'/'+file);
                })
            }
            callback(null,'public/help/'+req.params.umail);
        },
        filename: function(req, file, callback) {
            callback(null, file.originalname);
            img_url='help/'+req.params.umail+'/'+file.originalname;
            img_name=file.originalname;
        }
    });
 
    var itemupload = multer({ storage: imgicon }).single('uploads');

    itemupload(req, res, function(err) {
        if (err) {
            return res.send({ status: 'Error uploading file' });
        }
        else
        {
            res.send({ url: img_url,img_name:img_name});
        }
    });
});

router.get('/thogupu/getprofileinfo/:umail', function(req, res, next) {
    Thogupu.User.findOne({ email_id:req.params.umail }, function(err, data) {
       
        res.json(data)
    });
});

router.post('/thogupu/saveuserprofile', (req, res) => {
    var input = req.body;
    Thogupu.User.findOne({email_id:input.email_id }, function(err, data) {
        data.email_id=input.email_id;
        data.organization_name=input.organization_name;
        data.contact_no=input.contact_no;
        data.user_country=input.user_country;
        data.user_zipcode=input.user_zipcode;
        data.functional_role=input.functional_role;
        data.user_city=input.user_city;
        data.user_state=input.user_state;
        data.user_address=input.user_address;
        data.stack_holder=input.stack_holder;
        data.profile_path=input.file_path;
        data.save(function(err, result) { 
            if (err) {
                return res.status(500).json({
                    title: 'An error occurred',
                    error: err
                
                });
            }
            else
            {
                res.json(result);
            }
        });
    });
});

router.get('/thogupu/getcountrieslist', (req, res, next) => {
    Thogupu.Country.find({}, (err, result) => {
        if (err) {
            return res.status(500).json({
                title: 'An error occurred',
                error: err
            })
        } else {
            res.json(result)
            // console.log(result )
        }
    })
})

// FAQ_Help\

router.get('/faq/getfaqinfo/', function (req, res, next) {
    Thogupu.Faq.find({}, function (err, result) {
        console.log(err);
        if (err)
        {
            return res.status(500).json({
                title: 'An error occurred',
                error: err
            });
        }
        else
        { 
            console.log(result)
            res.json(result);
        }
    });
   
});

router.get('/thogupu/getinakkamapps', (req, res, next) => {
    Thogupu.Vertical.aggregate([
        { $unwind:'$system_info'},
        { $unwind:'$system_info.app_info'},

        {
            $group:
            {
                _id: {'_id':'$_id','vertical_name':'$vertical_name','system_name':'$system_info.system_name','app_id':'$system_info.app_info._id','app_name':'$system_info.app_info.app_name','app_url':'$system_info.app_info.app_url','app_desc':'$system_info.app_info.app_desc','app_img':'$system_info.app_info.app_img',}   
            }
        },
        {
            $project:
            {
                _id:0,
                vertical_name:'$_id.vertical_name',
                system_name:'$_id.system_name',
                app_id:'$_id.app_id',
                app_name:'$_id.app_name',
                app_url:'$_id.app_url',
                app_img:'$_id.app_img',
                app_desc:'$_id.app_desc'
            }
        },
        {
            $sort:{ "app_id" : 1 }
        }
    ],function (err, result) {
        if (err) {
            next(err);
        } 
        else 
        {
            res.json(result);
        }
    });
});

router.get('/thogupu/getsystemapps', (req, res, next) => {
    Thogupu.Vertical.aggregate([
        { $unwind:'$system_info'},

        {
            $group:
            {
                _id: {'_id':'$_id','vertical_name':'$vertical_name','system_name':'$system_info.system_name','app_info':'$system_info.app_info'}   
            }
        },
        {
            $project:
            {
                _id:0,
                vertical_name:'$_id.vertical_name',
                system_name:'$_id.system_name',
                app_info:'$_id.app_info'
            }
        },
        {
            $sort:{ "system_name" : 1 }
        }
    ],function (err, result) {
        if (err) {
            next(err);
        } 
        else 
        {
            res.json(result);
        }
    });
});


// # ┌────────────── second (optional)
// # │ ┌──────────── minute
// # │ │ ┌────────── hour
// # │ │ │ ┌──────── day of month
// # │ │ │ │ ┌────── month
// # │ │ │ │ │ ┌──── day of week
// # │ │ │ │ │ │
// # │ │ │ │ │ │
// # * * * * * *
        
var CronJob = require('cron').CronJob;
var job = new CronJob('0 30 10 * * *', function() {

console.log('You will see this message every 10 second');

var from_date = Date.now();
var to_date = new Date()
to_date.setDate(to_date.getDate()-1);
Thogupu.User.find({$and:[{ "created_date" : { $lte : from_date} },{ "created_date" : { $gte : to_date } }] }, function (err, result) {
    
    var str='';
    console.log(result)
    if (result.length > 0)
    {
        str='<div style="color: black;text-align: left;font-size: 22px; font-weight: bold;padding: 10px;">Hai , Good Morning , These are the users entered today...</div><table style="font-weight: bold;border-color: 1px solid green;"><tr style="font-size: 18px;background-color: #04AA6D;color: #F6F6F6;"><th style="width: 15%;text-align: center;padding:8px;">User Name</th><th style="width: 15%;text-align: center;padding:8px;">E-Mail ID</th><th style="width: 15%;text-align: center;padding:8px;">Organisation Name</th><th style="width: 15%;text-align: center;padding:8px;">Contact Number</th></tr>'
        result.forEach(function(item){
            str=str+'<tr style="background-color: #ddd;color: #323232;"><td style="width: 15%;text-align: center;padding:8px;">'+item.user_name+'</td><td style="width: 15%;text-align: center;padding:8px;">'+item.email_id+'</td><td style="width: 15%;text-align: center;padding:8px;">'+item.organization_name+'</td><td style="width: 15%;text-align: center;padding:8px;">'+item.contact_no+'</td></tr>'
        });
        str=str+'</table>';
    }
    else
    {
        str='Hai , Good Morning , No users are registered today !!!';
    }
    let messageOptions = {
    from: '"Jupiter Brothers" <contact@jupiterbrothers.com>',
    to: 'rajpillai@jupiterbrothers.com,saravana@jupiterbrothers.com , kannan@jupiterbrothers.com',
    subject: 'Thogupu - Users',
    text: 'Hai ,Good morning , Some users are entered today . These are the Lists... ',
    html: str
    };
    transporter.sendMail(messageOptions, function(error, info) {
        if (error)
        {
            throw error;
        }
        else 
        {
            console.log('Email successfully sent!');
        }
    });
});
}, null, true, );

job.start();



module.exports = router;