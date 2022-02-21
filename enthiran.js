var express = require('express');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var router = express.Router();
var mongoose = require ('mongoose');
var ObjectId=require('mongodb').ObjectID;
var QC = require('../models/enthiran_schema'); 
var Thogupu = require('../models/thogupu_schema');
var moment=require('moment');
var jwt = require('jsonwebtoken');
//const secret_key='aus@1208';
var jwtAuth = require('./jwt_auth.js');

const nodemailer = require('nodemailer');

router.use(session({secret:'meantext',resave:true,saveUninitialized:true}));  
router.use(cookieParser());

var bcrypt = require('bcrypt');
//const { User } = require('../models/qc_schema');
var salt = bcrypt.genSaltSync(10);

let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // secure:true for port 465, secure:false for port 587
    auth: {
        user: 'innowellgroup@gmail.com',
        pass: 'yrjbioaaayjxjncz'
    }
});
/* 
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

        //req.userId = decoded.jbuid;
        req.userName = decoded.qcuan;
        req.userEmail = decoded.qcmail;
        req.userAccess =  decoded.qcacc;
        next();
    });
}; */


router.get('/qc/checkmailid/:emailid', function (req, res, next) {
    
    QC.User.findOne({email_id:req.params.emailid}, function(err, data) {
        if(data==null)
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

router.get('/qc/checkpassword/:emailid/:pword', function (req, res, next) {
    QC.User.findOne({email_id:req.params.emailid}, function(err, data) {
        if(data==null)
        {
            res.status(201).json({
                msg: 'failure'
            });
        }
        else
        {
            bcrypt.compare(req.params.pword, data.pass_word, function(err, doesMatch){
                if(doesMatch)
                {
                    res.status(201).json({
                        msg: 'success'
                    });
                }
                else
                {
                    res.status(201).json({
                        msg: 'failure'
                    });
                }
            }); 
        }
    });
});

router.get('/qc/loginuser/:emailid/:pword', function (req, res, next) {
    QC.User.findOne({email_id:req.params.emailid}, function(err, data) {
        if(data==null)
        {
            res.status(201).json({
                msg: 'mail failure'
            });
        }
        else
        {
            bcrypt.compare(req.params.pword, data.pass_word, function(err, doesMatch){
                if(doesMatch)
                {
                    var qcufirst = data.user_name.charAt(0);
                    var token = jwt.sign({ qcuid: data._id,qcuan:data.user_name,qcufirst:qcufirst,qcimg:data.profile_img,qcmail:data.email_id,qcacc:data.access_level,qcnew:data.new_user }, secret_key,{expiresIn: 86400});      
                    res.status(201).json({
                        msg: 'success',
                        token:token
                    });
                }
                else
                {
                    res.status(201).json({
                        msg: 'password failure'
                    });
                }
            }); 
        }
    });
});

router.get('/qc/resetpassword/:emailid', function (req, res, next) {
    var randomstring = Math.random().toString(36).slice(-8);
    var passwordToSave = bcrypt.hashSync(randomstring, salt);
    QC.User.findOne({email_id:req.params.emailid}, function(err, data) {
        data.pass_word=passwordToSave;
        data.save(function(err, result) { 
            if (err) {
                return res.status(500).json({
                    title: 'An error occurred',
                    error: err
                });
            }
            else
            {
                let mailOptions = {
                    from: '"innowell" <innowellinternational@gmail.com>', // sender address
                    to: req.params.emailid, // list of receivers
                    //to: req.body.email,
                    subject: 'Enthiran - VPC MEP', // Subject line
                    text: 'Authentication', // plain text body
                    html: '<h5>Login credentials for Enthiran MEP VPC Tool:</h5><br/><b>Link :<a href="https://enthiran.jupiterbrothers.com//">https://enthiran.jupiterbrothers.com</a></b><br/><b>Mail ID :'+req.params.emailid+'</b><br/><b>Password :'+randomstring+'</b><br/>' // html body
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
});

router.get('/qc/changepassword/:uid/:pwd',jwtAuth, function (req, res, next) {
    var passwordToSave = bcrypt.hashSync(req.params.pwd, salt);
    QC.User.findById(ObjectId(req.params.uid),function(err, data){  
        data.pass_word=passwordToSave;
        data.new_user='no';
        data.save(function(err, result) { 
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

router.get('/qc/getuserslist',jwtAuth, function (req, res, next) {
    Thogupu.User.aggregate([ 
        {
            $group: {
                _id:{'_id':'$_id','user_name':'$user_name','emp_code':'$emp_code','email_id':'$email_id','mobile_no':'$mobile_no','service_name':'$service_name','access_level':'$access_level','profile_img':'$profile_img'},
            }
        },
        {
            $project:
            {
                _id:'$_id._id',
                user_name:'$_id.user_name',
                emp_code:'$_id.emp_code',
                email_id:'$_id.email_id',
                mobile_no:'$_id.mobile_no',
                service_name:'$_id.service_name',
                access_level:'$_id.access_level',
                profile_img:'$_id.profile_img',
            }
        }
    ], function (err, result) {
        if (err) {
            next(err);
        } 
        else 
        {
            res.json(result);
            
        }
    });
});
router.get('/qc/getservicelist',jwtAuth, function (req, res, next) {
    Thogupu.Service.aggregate([
        {
            $group: 
            {
                _id:{'_id':'$_id','service_name':'$service_name'}
            }
        },
        {
            $project:
            {
                _id:'$_id._id',
                id:'$_id.service_name',
                name:'$_id.service_name'
            }
        }
    ], function (err, result) {
        if (err) {
            next(err);
        } 
        else 
        {
            res.json(result);
        }
    });
});

router.post("/uploadprofilepic", function(req, res) {
    var multer = require('multer');
    var fs= require('fs');
    var img_url="";
    var img_name="";
    var imgicon = multer.diskStorage({
        destination: function(req, file, callback) {
            if (!fs.existsSync('public/profile'))
            {
                fs.mkdirSync('public/profile');   
            }
            else
            {
                var testFolder = 'public/profile';
                fs.readdirSync(testFolder).forEach(file => {
                    fs.unlinkSync(testFolder+'/'+file);
                })
            }
            callback(null,'public/profile');
        },
        filename: function(req, file, callback) {
            callback(null, file.originalname);
            img_url='/profile/'+file.originalname;
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
            res.send({ imgPath: img_url,imgName:img_name });
        }
    });
});

router.get('/qc/adduser/:uname/:empcode/:emailid/:mobile/:acclevel/:sname/:profileimg',jwtAuth, function (req, res, next) {
    var randomstring = Math.random().toString(36).slice(-8);
    var passwordToSave = bcrypt.hashSync(randomstring, salt);

    var user=new User({
        user_name:req.params.uname,
        emp_code:req.params.empcode,
        access_level:req.params.acclevel,
        pass_word:passwordToSave,
        email_id:req.params.emailid,
        mobile_no:req.params.mobile,
        service_name:req.params.sname,
        profile_img:req.params.profileimg,
        new_user:'yes'
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
            let mailOptions = {
                from: '"innowell" <innowellinternational@gmail.com>', // sender address
                to: req.params.emailid, // list of receivers
                subject: 'Enthiran - VPC MEP', // Subject line
                text: 'Authentication', // plain text body
                html: '<h5>Login credentials for Enthiran MEP VPC Tool:</h5><br/><b>Link :<a href="https://enthiran.jupiterbrothers.com//">https://enthiran.jupiterbrothers.com</a></b><br/><b>Mail ID :'+req.params.emailid+'</b><br/><b>Password :'+randomstring+'</b><br/>' // html body
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    return console.log(error);
                }
                console.log('Message %s sent: %s', info.messageId, info.response);
                QC.User.aggregate([ 
                    {
                        $group: {
                            _id:{'access_level':'$access_level'},
                            user_info:
                            { 
                                $addToSet: 
                                {
                                    user_id:'$_id',
                                    user_name:'$user_name',
                                    emp_code:'$emp_code',
                                    email_id:'$email_id',
                                    mobile_no:'$mobile_no',
                                    profile_img:'$profile_img'
                                }
                            }
                        }
                    },
                    {
                        $project:
                        {
                            _id:0,
                            access_level:'$_id.access_level',
                            user_info:'$user_info'
                        }
                    }
                ], function (err, result) {
                    if (err) {
                        next(err);
                    } 
                    else 
                    {
                        res.json(result);
                    }
                });
            });
        }
    });
});

router.get('/qc/edituser/:uid/:uname/:empcode/:emailid/:mobile/:acclevel/:sname/:profileimg',jwtAuth, function (req, res, next) {
    QC.User.findById(ObjectId(req.params.uid),function(err, data){  
        data.user_name=req.params.uname;
        data.emp_code=req.params.empcode;
        data.email_id=req.params.emailid;
        data.mobile_no=req.params.mobile; 
        data.access_level=req.params.acclevel;    
        data.service_name=req.params.sname;   
        data.profile_img=req.params.profileimg;

        data.save(function(err, result) { 
            if (err) {
                return res.status(500).json({
                    title: 'An error occurred',
                    error: err
                });
            }
            QC.User.aggregate([ 
                {
                    $group: {
                        _id:{'access_level':'$access_level'},
                        user_info:
                        { 
                            $addToSet: 
                            {
                                user_id:'$_id',
                                user_name:'$user_name',
                                emp_code:'$emp_code',
                                email_id:'$email_id',
                                mobile_no:'$mobile_no',
                                service_name:'$service_name',
                                accesslevel:'$access_level',
                                profile_img:'$profile_img'
                            }
                        }
                    }
                },
                {
                    $project:
                    {
                        _id:0,
                        access_level:'$_id.access_level',
                        user_info:'$user_info'
                    }
                }
            ], function (err, result) {
                if (err) {
                    next(err);
                } 
                else 
                {
                    res.json(result);
                }
            });
        });
    });
});

router.get('/qc/getuserinfo/:uid',jwtAuth, function (req, res, next) {
    QC.User.findById(ObjectId(req.params.uid),function(err, data){  
        res.status(201).json({
            user_name:data.user_name,
            emp_code:data.emp_code,
            email_id:data.email_id,
            mobile_no:data.mobile_no,
            access_level:data.access_level,
            service_name:data.service_name,
            profile_img:data.profile_img
        });
    });
});

router.get('/qc/removeuser/:uid',jwtAuth, function (req, res, next) {
    QC.User.remove({'_id': ObjectId(req.params.uid)},function (err, result1) {
        QC.User.aggregate([ 
            {
                $group: {
                    _id:{'access_level':'$access_level'},
                    user_info:
                    { 
                        $addToSet: 
                        {
                            user_id:'$_id',
                            user_name:'$user_name',
                            emp_code:'$emp_code',
                            email_id:'$email_id',
                            mobile_no:'$mobile_no',
                            service_name:'$service_name',
                            accesslevel:'$access_level',
                            profile_img:'$profile_img'
                        }
                    }
                }
            },
            {
                $project:
                {
                    _id:0,
                    access_level:'$_id.access_level',
                    user_info:'$user_info'
                }
            }
        ], function (err, result) {
            if (err) {
                next(err);
            } 
            else 
            {
                res.json(result);
            }
        });
    });
});

router.get('/qc/getprojectslist',jwtAuth, function (req, res, next) {
    QC.Project.aggregate([
        //{ $match:{"project_status":{ $eq: 'save' }}},   
        {
            $group: {
                _id:{'_id':'$_id','project_name':'$project_name','project_status':'$project_status','manager_info':'$manager_info','leader_info':'$leader_info','engineers_info':'$engineers_info'}
            }
        },
        {
            $project:
            {
                _id:'$_id._id',
                project_name:'$_id.project_name',
                project_status:'$_id.project_status',
                manager_info:'$_id.manager_info',
                leader_info:'$_id.leader_info',
                engineers_info:'$_id.engineers_info'
            }
        },  
        {
            $sort:
            {
                '_id' :-1
            }
        }
    ], function (err, result) {
        if (err) {
            next(err);
        } else {
            res.json(result);
        }
    });
});

router.get('/qc/getprojectinfo/:pid',jwtAuth, function (req, res, next) {
    QC.Project.findOne({"_id":{ $eq: ObjectId(req.params.pid) }},function(err, data){ 
        var r=data.revision_info[data.revision_info.length-1];
        var teamManager=[];
        var teamLeader=[];
        var serviceEngineer=[];
        var selectedServices=[];
        data.team_info.forEach(function(item){
            if(item.user_role=='Project Manager')
            {
                teamManager.push({
                    id:item.user_name,
                    name:item.user_name,
                    email_id:item.email_id,
                    profile_img:item.profile_img
                });
            }
            else if(item.user_role=='Reviewer')
            {
                teamLeader.push({
                    id:item.user_name,
                    name:item.user_name,
                    email_id:item.email_id,
                    profile_img:item.profile_img
                });
            }
            else if(item.user_role=='User')
            {
                serviceEngineer.push({
                    id:item.user_name,
                    name:item.user_name,
                    email_id:item.email_id,
                    profile_img:item.profile_img
                });
            }
        });

        r.project_services.forEach(function(s){
            selectedServices.push(s.service_name)
        });

        Thogupu.Service.aggregate([
            { $match:{"service_name":{ $in: selectedServices }}},  
            { $unwind: '$system_info' },
            {
                $group:
                {
                    _id: {'_id':'$system_info.system_name'}
                }
            },
            {
                $project:
                {
                    _id:'$_id._id',
                    id:'$_id._id',
                    name:'$_id._id'
                }
            },
            { 
                $sort : { _id : 1}
            }
        ], function (err, result) {
            if (err) {
                next(err);
            } 
            else 
            {
                Thogupu.Service.aggregate([
                    { $match:{"service_name":{ $in: selectedServices }}},  
                    { $unwind: '$code_info' },
                    {
                        $group:
                        {
                            _id: {'_id':'$code_info.code_name'}
                        }
                    },
                    {
                        $project:
                        {
                            _id:'$_id._id',
                            id:'$_id._id',
                            name:'$_id._id'
                        }
                    },
                    { 
                        $sort : { _id : 1}
                    }
                ], function (err, result2) {
                    if (err) {
                        next(err);
                    } 
                    else 
                    {
                        res.status(201).json({
                            project_name:data.project_name,
                            rid:r._id,
                            manager_info:data.manager_info,
                            leader_info:data.leader_info,
                            engineers_info:data.engineers_info,
                            drawing_filepath:data.drawing_filepath,
                            project_country:data.project_country,
                            project_state:data.project_state,
                            project_type:data.project_type,
                            project_subtype_info:data.project_subtype_info,
                            permit_manager:data.permit_manager,
                            projectarea_sqft:data.projectarea_sqft,
                            projectarea_sqmt:data.projectarea_sqmt,
                            project_services:r.project_services,
                            systemList:result,
                            codeList:result2,
                            managerList:teamManager,
                            leaderList:teamLeader,
                            engineerList:serviceEngineer
                        });
                    }
                });
            }
        });
    });
});

router.post("/uploadcheckpoint/:uname", function(req, res) {
    var multer = require('multer');
    var fs= require('fs');
    var file_url="";
    var imgicon = multer.diskStorage({
        destination: function(req, file, callback) {
            if (!fs.existsSync('public/checkpoints'))
            {
                fs.mkdirSync('public/checkpoints');   
            }
            else
            {
                var testFolder = 'public/checkpoints';
                fs.readdirSync(testFolder).forEach(file => {
                    fs.unlinkSync(testFolder+'/'+file);
                })
            }
            callback(null,'public/checkpoints');
        },
        filename: function(req, file, callback) {
            callback(null, file.originalname);
            file_url='checkpoints/'+file.originalname;
        }
    });
 
    var itemupload = multer({ storage: imgicon }).single('uploads');

    itemupload(req, res, function(err) {
        if (err) {
            return res.send({ status: 'Error uploading file' });
        }
        else
        {
            const ExcelJS = require('exceljs');
            const workbook = new ExcelJS.Workbook();
            var checkPoint=[];
            workbook.xlsx.readFile('public/'+file_url).then(function() {
                workbook.eachSheet((sheet, id) => {
                    sheet.eachRow((row, rowIndex) => {
                      if(rowIndex>1)
                      {
                        checkPoint.push({
                            checkpoint_name:row.values[2],
                            error_class:'New Critical',
                            created_by:req.params.uname,
                            created_date:new Date()
                        });
                      }
                    });
                });
                QC.Temp.insertMany(checkPoint, function (err, docs) {
                    if (err){ 
                        return console.error(err);
                    } 
                    else 
                    {
                        console.log("Multiple documents inserted to Collection");
                        res.json('saved');
                    }
                });
            });
        }
    });
});


router.get('/qc/getgeneraldetails',jwtAuth, function (req, res, next) {

    Thogupu.Country.aggregate([
        {
            $group: {
                _id:{'_id':'$_id','country_name':'$country_name'}
            }
        },
        {
            $project:
            {
                _id:0,
                id:'$_id.country_name',
                name:'$_id.country_name'
            }
        },  
        {
            $sort:
            {
                'id' :-1
            }
        }
    ], function (err, result1) {
        if (err) {
            next(err);
        } 
        else 
        {
            Thogupu.Service.aggregate([
                {
                    $group: {
                        _id:{'_id':'$_id','service_name':'$service_name'}
                    }
                },
                {
                    $project:
                    {
                        _id:0,
                        id:'$_id.service_name',
                        name:'$_id.service_name'
                    }
                },  
                {
                    $sort:
                    {
                        'id' :-1
                    }
                }
            ], function (err, result2) {
                if (err) {
                    next(err);
                } 
                else 
                {
                    Thogupu.PType.aggregate([
                        {
                            $group: {
                                _id:{'_id':'$_id','project_type':'$project_type'}
                            }
                        },
                        {
                            $project:
                            {
                                _id:0,
                                id:'$_id.project_type',
                                name:'$_id.project_type'
                            }
                        },  
                        {
                            $sort:
                            {
                                'id' :-1
                            }
                        }
                    ], function (err, result3) {
                        if (err) {
                            next(err);
                        } 
                        else 
                        {
                            QC.Client.aggregate([
                                {
                                    $group: {
                                        _id:{'_id':'$_id','client_name':'$client_name'}
                                    }
                                },
                                {
                                    $project:
                                    {
                                        _id:0,
                                        id:'$_id.client_name',
                                        name:'$_id.client_name'
                                    }
                                },  
                                {
                                    $sort:
                                    {
                                        'id' :-1
                                    }
                                }
                            ], function (err, result4) {
                                if (err) {
                                    next(err);
                                } 
                                else 
                                {   
                                    QC.Error.aggregate([
                                        {
                                            $group: {
                                                _id:{'_id':'$_id','error_impact':'$error_impact'}
                                            }
                                        },
                                        {
                                            $project:
                                            {
                                                _id:0,
                                                id:'$_id._id',
                                                name:'$_id.error_impact'
                                            }
                                        },  
                                        {
                                            $sort:
                                            {
                                                'id' :-1
                                            }
                                        }
                                    ], function (err, result5) {
                                        if (err) {
                                            next(err);
                                        } 
                                        else 
                                        {
                                            Thogupu.User.aggregate([
                                                {
                                                    $group: {
                                                        _id:{'_id':'$_id','user_name':'$user_name','access_level':'$access_level','email_id':'$email_id','profile_img':'$profile_img'}
                                                    }
                                                },
                                                {
                                                    $project:
                                                    {
                                                        _id:'$_id._id',
                                                        user_name:'$_id.user_name',
                                                        access_level:'$_id.access_level',
                                                        email_id:'$_id.email_id',
                                                        profile_img:'$_id.profile_img'
                                                    }
                                                },  
                                                {
                                                    $sort:
                                                    {
                                                        '_id' :-1
                                                    }
                                                }
                                            ], function (err, result) {
                                                if (err) {
                                                    next(err);
                                                } 
                                                else 
                                                {
                                                    var teamLeader=[];
                                                    var serviceEngineer=[];
                                                    var teamManager=[];
                                                    var teamAdmin=[];
                                                    var usersList=[];
                                                    result.forEach(function(user){
                                                        if(user.access_level=='Team Leader')
                                                        {
                                                            teamLeader.push({
                                                                id:user.user_name,
                                                                name:user.user_name,
                                                                email_id:user.email_id,
                                                                profile_img:user.profile_img
                                                            });
                                                        }
                                                        else if(user.access_level=='Service Engineer')
                                                        {
                                                            serviceEngineer.push({
                                                                id:user.user_name,
                                                                name:user.user_name,
                                                                email_id:user.email_id,
                                                                profile_img:user.profile_img
                                                            });
                                                        }
                                                        else if(user.access_level=='Manager')
                                                        {
                                                            teamManager.push({
                                                                id:user.user_name,
                                                                name:user.user_name,
                                                                email_id:user.email_id,
                                                                profile_img:user.profile_img
                                                            });
                                                        } 
                                                        usersList.push({
                                                            id:user.user_name,
                                                            name:user.user_name,
                                                        });
                                                    });
                                                    res.status(201).json({
                                                        usersList:usersList,
                                                        managerList:teamManager,
                                                        leaderList:teamLeader,
                                                        engineerList:serviceEngineer,
                                                        countryList:result1,
                                                        serviceList:result2,
                                                        projectTypeList:result3,
                                                        clientList:result4,
                                                        errorImpactList:result5
                                                    });
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
        }
    });
});

router.get('/qc/getprojectmembers/:pid/:rid',jwtAuth, function (req, res, next) {
    QC.Project.findById(ObjectId(req.params.pid),function(err, data){  
        var selectedManager=[];
        var selectedLeader=[];
        var selectedEngineer=[];
        var selectedPSubType=[];
        var selectedService=[];
        var selectedSystem=[];
        var selectedItem=[];
        var selectedMainCatg=[];
        var selectedSubCatg=[];
        var selectedParameter=[];
        var selectedCode=[];

        var selectedCountry={
            id:data.project_country,
            name:data.project_country
        };
        var selectedState={
            id:data.project_state,
            name:data.project_state
        };
        var selectedPType={
            id:data.project_type,
            name:data.project_type
        };

        data.project_subtype_info.forEach(function(item){
            selectedPSubType.push({
                id:item.project_subtype,
                name:item.project_subtype
            });
        });

        data.manager_info.forEach(function(item){
            selectedManager.push({
                id:item.user_name,
                name:item.user_name,
                email_id:item.email_id,
                profile_img:item.profile_img
            })
        });
        data.leader_info.forEach(function(item){
            selectedLeader.push({
                id:item.user_name,
                name:item.user_name,
                email_id:item.email_id,
                profile_img:item.profile_img
            })
        });
        data.engineers_info.forEach(function(item){
            selectedEngineer.push({
                id:item.user_name,
                name:item.user_name,
                email_id:item.email_id,
                profile_img:item.profile_img
            })
        });

        var t=data.revision_info.id(ObjectId(req.params.rid));

        var services=[];
        t.project_services.forEach(function(item){
            selectedService.push({
                id:item.service_name,
                name:item.service_name
            });
            services.push(item.service_name);
        });

        var systems=[];
        t.project_systems.forEach(function(item){
            selectedSystem.push({
                id:item.system_name,
                name:item.system_name
            });
            systems.push(item.system_name);
        });

        var items=[];
        t.project_items.forEach(function(item){
            selectedItem.push({
                id:item.item_name,
                name:item.item_name
            });
            items.push(item.item_name);
        });

        var maincatgs=[];
        t.project_main_category.forEach(function(item){
            selectedMainCatg.push({
                id:item.main_category_name,
                name:item.main_category_name
            });
            maincatgs.push(item.main_category_name);
        });

        var subcatgs=[];
        t.project_sub_category.forEach(function(item){
            selectedSubCatg.push({
                id:item.sub_category_name,
                name:item.sub_category_name
            });
            subcatgs.push(item.sub_category_name);
        });

        t.project_parameter.forEach(function(item){
            selectedParameter.push({
                id:item.parameter_name,
                name:item.parameter_name
            });
        });

        t.project_codes.forEach(function(item){
            selectedCode.push({
                id:item.code_name,
                name:item.code_name
            });
        });

        Thogupu.Service.aggregate([
            { $match:{"service_name":{ $in: services }}},  
            { $unwind: '$system_info' },
            {
                $group:
                {
                    _id: {'_id':'$system_info.system_name'}
                }
            },
            {
                $project:
                {
                    _id:'$_id._id',
                    id:'$_id._id',
                    name:'$_id._id'
                }
            },
            { 
                $sort : { _id : 1}
            }
        ], function (err, result) {
            if (err) {
                next(err);
            } 
            else 
            {
                Thogupu.Service.aggregate([
                    { $match:{"service_name":{ $in: services }}},  
                    { $unwind: '$code_info' },
                    {
                        $group:
                        {
                            _id: {'_id':'$code_info.code_name'}
                        }
                    },
                    {
                        $project:
                        {
                            _id:'$_id._id',
                            id:'$_id._id',
                            name:'$_id._id'
                        }
                    },
                    { 
                        $sort : { _id : 1}
                    }
                ], function (err, result2) {
                    if (err) {
                        next(err);
                    } 
                    else 
                    {
                       
                        if(systems.length>0)
                        {
                            Thogupu.Service.aggregate([
                                { $match:{"service_name":{ $in: services }}},  
                                { $unwind: '$system_info' },
                                { $match:{"system_info.system_name": { $in: systems } }},  
                                { $unwind: '$system_info.item_info' },
                                {
                                    $group:
                                    {
                                        _id: {'_id':'$system_info.item_info.item_name'}
                                        
                                    }
                                },
                                {
                                    $project:
                                    {
                                        _id:'$_id._id',
                                        id:'$_id._id',
                                        name:'$_id._id'
                                    }
                                },
                                { 
                                    $sort : { _id : 1}
                                }
                            ], function (err, result3) {
                                if (err) {
                                    next(err);
                                } 
                                else 
                                {
                                    if(items.length>0)
                                    {
                                        Thogupu.Service.aggregate([
                                            { $match:{"service_name":{ $in: services }}},    
                                            { $unwind: '$system_info' },
                                            { $match:{"system_info.system_name": { $in: systems } }}, 
                                            { $unwind: '$system_info.item_info' },
                                            { $match:{"system_info.item_info.item_name": { $in: items } }},
                                            { $unwind: '$system_info.item_info.main_category_info' },
                                            {
                                                $group:
                                                {
                                                    _id: {'_id':'$system_info.item_info.main_category_info.main_category_name'}
                                                    
                                                }
                                            },
                                            {
                                                $project:
                                                {
                                                    _id:'$_id._id',
                                                    id:'$_id._id',
                                                    name:'$_id._id'
                                                }
                                            },
                                            { 
                                                $sort : { _id : 1}
                                            }
                                        ], function (err, result4) {
                                            if (err) {
                                                next(err);
                                            } 
                                            else 
                                            {
                                                if(maincatgs.length>0)
                                                {
                                                    Thogupu.Service.aggregate([
                                                        { $match:{"service_name":{ $in: services }}},    
                                                        { $unwind: '$system_info' },
                                                        { $match:{"system_info.system_name": { $in: systems } }},  
                                                        { $unwind: '$system_info.item_info' },
                                                        { $match:{"system_info.item_info.item_name": { $in: items } }},
                                                        { $unwind: '$system_info.item_info.main_category_info' },
                                                        { $match:{"system_info.item_info.main_category_info.main_category_name": { $in: maincatgs } }},
                                                        { $unwind: '$system_info.item_info.main_category_info.sub_category_info' },
                                                        {
                                                            $group:
                                                            {
                                                                _id: {'_id':'$system_info.item_info.main_category_info.sub_category_info.sub_category_name'}
                                                                
                                                            }
                                                        },
                                                        {
                                                            $project:
                                                            {
                                                                _id:'$_id._id',
                                                                id:'$_id._id',
                                                                name:'$_id._id'
                                                            }
                                                        },
                                                        { 
                                                            $sort : { _id : 1}
                                                        }
                                                    ], function (err, result5) {
                                                        if (err) {
                                                            next(err);
                                                        } 
                                                        else 
                                                        {
                                                            if(subcatgs.length>0)
                                                            {
                                                                Thogupu.Service.aggregate([
                                                                    { $match:{"service_name":{ $in: services }}},    
                                                                    { $unwind: '$system_info' },
                                                                    { $match:{"system_info.system_name": { $in: systems } }},  
                                                                    { $unwind: '$system_info.item_info' },
                                                                    { $match:{"system_info.item_info.item_name": { $in: items } }},
                                                                    { $unwind: '$system_info.item_info.main_category_info' },
                                                                    { $match:{"system_info.item_info.main_category_info.main_category_name": { $in: maincatgs } }},
                                                                    { $unwind: '$system_info.item_info.main_category_info.sub_category_info' },
                                                                    { $match:{"system_info.item_info.main_category_info.sub_category_info.sub_category_name":  { $in: subcatgs } }},
                                                                    { $unwind: '$system_info.item_info.main_category_info.sub_category_info.parameter_info' },
                                                                    {
                                                                        $group:
                                                                        {
                                                                            _id: {'_id':'$system_info.item_info.main_category_info.sub_category_info.parameter_info.parameter_name'}
                                                                            
                                                                        }
                                                                    },
                                                                    {
                                                                        $project:
                                                                        {
                                                                            _id:'$_id._id',
                                                                            id:'$_id._id',
                                                                            name:'$_id._id'
                                                                        }
                                                                    },
                                                                    { 
                                                                        $sort : { _id : 1}
                                                                    }
                                                                ], function (err, result6) {
                                                                    if (err) {
                                                                        next(err);
                                                                    } 
                                                                    else 
                                                                    {
                                                                        res.status(201).json({
                                                                            project_name:data.project_name,
                                                                            projectarea_sqft:data.projectarea_sqft,
                                                                            projectarea_sqmt:data.projectarea_sqmt,
                                                                            selectedCountry:selectedCountry,
                                                                            selectedState:selectedState,
                                                                            drawing_filepath:data.drawing_filepath,
                                                                            client_name:data.client_name,
                                                                            architect_name:data.architect_name,
                                                                            project_state:data.project_state,
                                                                            selectedPType:selectedPType,
                                                                            selectedPSubType:selectedPSubType,
                                                                            selectedManager:selectedManager,
                                                                            selectedLeader:selectedLeader,
                                                                            selectedEngineer:selectedEngineer,
                                                                            selectedService:selectedService,
                                                                            selectedSystem:selectedSystem,
                                                                            selectedItem:selectedItem,
                                                                            selectedMainCatg:selectedMainCatg,
                                                                            selectedSubCatg:selectedSubCatg,
                                                                            selectedParameter:selectedParameter,
                                                                            selectedCode:selectedCode,
                                                                            systemList:result,
                                                                            codeList:result2,
                                                                            itemList:result3,
                                                                            mainCatgList:result4,
                                                                            subCatgList:result5,
                                                                            parameterList:result6
                                                                        })
                                                                    }
                                                                });
                                                            }
                                                            else
                                                            {
                                                                res.status(201).json({
                                                                    project_name:data.project_name,
                                                                    projectarea_sqft:data.projectarea_sqft,
                                                                    projectarea_sqmt:data.projectarea_sqmt,
                                                                    selectedCountry:selectedCountry,
                                                                    selectedState:selectedState,
                                                                    drawing_filepath:data.drawing_filepath,
                                                                    client_name:data.client_name,
                                                                    architect_name:data.architect_name,
                                                                    project_state:data.project_state,
                                                                    selectedPType:selectedPType,
                                                                    selectedPSubType:selectedPSubType,
                                                                    selectedManager:selectedManager,
                                                                    selectedLeader:selectedLeader,
                                                                    selectedEngineer:selectedEngineer,
                                                                    selectedService:selectedService,
                                                                    selectedSystem:selectedSystem,
                                                                    selectedItem:selectedItem,
                                                                    selectedMainCatg:selectedMainCatg,
                                                                    selectedSubCatg:selectedSubCatg,
                                                                    selectedParameter:selectedParameter,
                                                                    selectedCode:selectedCode,
                                                                    systemList:result,
                                                                    codeList:result2,
                                                                    itemList:result3,
                                                                    mainCatgList:result4,
                                                                    subCatgList:result5,
                                                                    parameterList:[]
                                                                })
                                                            }
                                                        }
                                                    });
                                                }
                                                else
                                                {
                                                    res.status(201).json({
                                                        project_name:data.project_name,
                                                        projectarea_sqft:data.projectarea_sqft,
                                                        projectarea_sqmt:data.projectarea_sqmt,
                                                        selectedCountry:selectedCountry,
                                                        selectedState:selectedState,
                                                        drawing_filepath:data.drawing_filepath,
                                                        client_name:data.client_name,
                                                        architect_name:data.architect_name,
                                                        project_state:data.project_state,
                                                        selectedPType:selectedPType,
                                                        selectedPSubType:selectedPSubType,
                                                        selectedManager:selectedManager,
                                                        selectedLeader:selectedLeader,
                                                        selectedEngineer:selectedEngineer,
                                                        selectedService:selectedService,
                                                        selectedSystem:selectedSystem,
                                                        selectedItem:selectedItem,
                                                        selectedMainCatg:selectedMainCatg,
                                                        selectedSubCatg:selectedSubCatg,
                                                        selectedParameter:selectedParameter,
                                                        selectedCode:selectedCode,
                                                        systemList:result,
                                                        codeList:result2,
                                                        itemList:result3,
                                                        mainCatgList:result4,
                                                        subCatgList:[],
                                                        parameterList:[]
                                                    })
                                                }
                                            }
                                        });
                                    }
                                    else
                                    {
                                        res.status(201).json({
                                            project_name:data.project_name,
                                            projectarea_sqft:data.projectarea_sqft,
                                            projectarea_sqmt:data.projectarea_sqmt,
                                            selectedCountry:selectedCountry,
                                            selectedState:selectedState,
                                            drawing_filepath:data.drawing_filepath,
                                            client_name:data.client_name,
                                            architect_name:data.architect_name,
                                            project_state:data.project_state,
                                            selectedPType:selectedPType,
                                            selectedPSubType:selectedPSubType,
                                            selectedManager:selectedManager,
                                            selectedLeader:selectedLeader,
                                            selectedEngineer:selectedEngineer,
                                            selectedService:selectedService,
                                            selectedSystem:selectedSystem,
                                            selectedItem:selectedItem,
                                            selectedMainCatg:selectedMainCatg,
                                            selectedSubCatg:selectedSubCatg,
                                            selectedParameter:selectedParameter,
                                            selectedCode:selectedCode,
                                            systemList:result,
                                            codeList:result2,
                                            itemList:result3,
                                            mainCatgList:[],
                                            subCatgList:[],
                                            parameterList:[]
                                        })
                                    }
                                }
                            });
                        }
                        else
                        {
                            res.status(201).json({
                                project_name:data.project_name,
                                projectarea_sqft:data.projectarea_sqft,
                                projectarea_sqmt:data.projectarea_sqmt,
                                selectedCountry:selectedCountry,
                                selectedState:selectedState,
                                drawing_filepath:data.drawing_filepath,
                                client_name:data.client_name,
                                architect_name:data.architect_name,
                                project_state:data.project_state,
                                selectedPType:selectedPType,
                                selectedPSubType:selectedPSubType,
                                selectedManager:selectedManager,
                                selectedLeader:selectedLeader,
                                selectedEngineer:selectedEngineer,
                                selectedService:selectedService,
                                selectedSystem:selectedSystem,
                                selectedItem:selectedItem,
                                selectedMainCatg:selectedMainCatg,
                                selectedSubCatg:selectedSubCatg,
                                selectedParameter:selectedParameter,
                                selectedCode:selectedCode,
                                systemList:result,
                                codeList:result2,
                                itemList:[],
                                mainCatgList:[],
                                subCatgList:[],
                                parameterList:[]
                            })
                        }
                    }
                });
            }
        });
    });
});

router.get('/qc/getprojectstate/:cname',jwtAuth, function (req, res, next) {
    Thogupu.Country.aggregate([
        { $match:{"country_name":req.params.cname}},  
        { $unwind: '$state_info' },
        {
            $group: {
                _id:{'_id':'$state_info._id','state_name':'$state_info.state_name'}
            }
        },
        {
            $project:
            {
                _id:0,
                id:'$_id._id',
                name:'$_id.state_name'
            }
        },  
        {
            $sort:
            {
                'id' :-1
            }
        }
    ], function (err, result) {
        if (err) {
            next(err);
        } 
        else 
        {
            res.json(result);
        }
    });
});

router.get('/qc/getprojectdistrict/:countries/:states',jwtAuth, function (req, res, next) {
    Thogupu.Country.aggregate([
        { $match:{"country_name":req.params.countries}},  
        { $unwind: '$state_info' },
        { $match:{"state_info.state_name":req.params.states}},  
        { $unwind: '$state_info.district_info' },
        {
            $group: {
                _id:{'_id':'$state_info.district_info._id','district_name':'$state_info.district_info.district_name'}
            }
        },
        {
            $project:
            {
                _id:0,
                id:'$_id._id',
                name:'$_id.district_name'
            }
        },  
        {
            $sort:
            {
                'id' :-1
            }
        }
    ], function (err, result) {
        if (err) {
            next(err);
        } 
        else 
        {
            res.json(result);
        }
    });
});

router.get('/qc/getprojectcity/:countries/:states/:districts',jwtAuth, function (req, res, next) {
    Thogupu.Country.aggregate([
        { $match:{"country_name":req.params.countries}},  
        { $unwind:'$state_info' },
        { $match:{"state_info.state_name":req.params.states}},  
        { $unwind:'$state_info.district_info' },
        { $match:{"state_info.district_info.district_name":req.params.districts}},  
        { $unwind:'$state_info.district_info.city_info' },
        {
            $group: {
                _id:{'_id':'$state_info.district_info.city_info._id','city_name':'$state_info.district_info.city_info.city_name'}
            }
        },
        {
            $project:
            {
                _id:0,
                id:'$_id._id',
                name:'$_id.city_name'
            }
        },  
        {
            $sort:
            {
                'id' :-1
            }
        }
    ], function (err, result) {
        if (err) {
            next(err);
        } 
        else 
        {
            res.json(result);
        }
    });
});


router.get('/qc/changeprojecttype/:pname',jwtAuth, function (req, res, next) {
   
    Thogupu.PType.aggregate([
        { $match:{"project_type": req.params.pname }},  
        { $unwind: '$sub_type_info' },
        {
            $group:
            {
                _id: {'_id':'$sub_type_info._id','project_sub_type':'$sub_type_info.project_sub_type'}
                
            }
        },
        {
            $project:
            {
                _id:'$_id._id',
                id:'$_id.project_sub_type',
                name:'$_id.project_sub_type'
            }
        },
        { 
            $sort : { _id : 1}
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

router.get('/qc/changeprojectservice/:services/:systems/:items/:mcatgs/:scatgs/:paras/:codes',jwtAuth, function (req, res, next) {
    var services=JSON.parse(req.params.services);
    var systems=JSON.parse(req.params.systems);
    var items=JSON.parse(req.params.items);
    var mcatgs=JSON.parse(req.params.mcatgs);
    var scatgs=JSON.parse(req.params.scatgs);
    var paras=JSON.parse(req.params.paras);
    var codes=JSON.parse(req.params.codes);

    var selectedServices=[];
    services.forEach(function(item){
        selectedServices.push(item.name);
    });
    var selectedSystems=[];
    var selectedItems=[];
    var selectedMCatgs=[];
    var selectedSCatgs=[];

    var subDocument1=[];
    var subDocument2=[];
    var subDocument3=[];
    var subDocument4=[];
    var subDocument5=[];
    var subDocument6=[];

    if(services.length>0)
    {
        Thogupu.Service.aggregate([
            { $match:{"service_name":{ $in: selectedServices }}},  
            { $unwind: '$code_info' },
            {
                $group: {
                    _id:{'_id':'$code_info.code_name'}
                }
            },
            {
                $project:
                {
                    _id:0,
                    id:'$_id._id',
                    name:'$_id._id'
                }
            },  
            {
                $sort:
                {
                    'id' :-1
                }
            }
        ], function (err, result5) {
            if (err) {
                next(err);
            } 
            else 
            {
                result5.forEach(function(ci){
                    var index = codes.findIndex(x => x.name==ci.name);
                    if(index>=0)
                    {
                        subDocument6.push({
                            id:ci.name,
                            name:ci.name,
                        });
                    }
                }); 

                Thogupu.Service.aggregate([
                    { $match:{"service_name":{ $in: selectedServices }}},  
                    { $unwind: '$system_info' },
                    {
                        $group: {
                            _id:{'_id':'$system_info.system_name'}
                        }
                    },
                    {
                        $project:
                        {
                            _id:0,
                            id:'$_id._id',
                            name:'$_id._id'
                        }
                    },  
                    {
                        $sort:
                        {
                            'id' :-1
                        }
                    }
                ], function (err, result) {
                    if (err) {
                        next(err);
                    } 
                    else 
                    {
                        result.forEach(function(ci){
                            var index = systems.findIndex(x => x.name==ci.name);
                            if(index>=0)
                            {
                                subDocument1.push({
                                    id:ci.name,
                                    name:ci.name,
                                });
                                selectedSystems.push(ci.name);
                            }
                        }); 
                        if(subDocument1.length>0)
                        {
                            Thogupu.Service.aggregate([
                                { $match:{"service_name":{ $in: selectedServices }}},  
                                { $unwind: '$system_info' },
                                { $match:{"system_info.system_name":{ $in: selectedSystems }}},  
                                { $unwind: '$system_info.item_info' },
                                {
                                    $group: {
                                        _id:{'_id':'$system_info.item_info.item_name'}
                                    }
                                },
                                {
                                    $project:
                                    {
                                        _id:0,
                                        id:'$_id._id',
                                        name:'$_id._id'
                                    }
                                },  
                                {
                                    $sort:
                                    {
                                        'id' :-1
                                    }
                                }
                            ], function (err, result1) {
                                if (err) {
                                    next(err);
                                } 
                                else 
                                {
                                    result1.forEach(function(ci){
                                        var index = items.findIndex(x => x.name==ci.name);
                                        if(index>=0)
                                        {
                                            subDocument2.push({
                                                id:ci.name,
                                                name:ci.name,
                                            });
                                            selectedItems.push(ci.name);
                                        }
                                    }); 
                                    if(subDocument2.length>0)
                                    {
                                        Thogupu.Service.aggregate([
                                            { $match:{"service_name":{ $in: selectedServices }}},  
                                            { $unwind: '$system_info' },
                                            { $match:{"system_info.system_name":{ $in: selectedSystems }}},  
                                            { $unwind: '$system_info.item_info' },
                                            { $match:{"system_info.item_info.item_name":{ $in: selectedItems }}},  
                                            { $unwind: '$system_info.item_info.main_category_info' },
                                            {
                                                $group: {
                                                    _id:{'_id':'$system_info.item_info.main_category_info.main_category_name'}
                                                }
                                            },
                                            {
                                                $project:
                                                {
                                                    _id:0,
                                                    id:'$_id._id',
                                                    name:'$_id._id'
                                                }
                                            },  
                                            {
                                                $sort:
                                                {
                                                    'id' :-1
                                                }
                                            }
                                        ], function (err, result2) {
                                            if (err) {
                                                next(err);
                                            } 
                                            else 
                                            {
                                                result2.forEach(function(ci){
                                                    var index = mcatgs.findIndex(x => x.name==ci.name);
                                                    if(index>=0)
                                                    {
                                                        subDocument3.push({
                                                            id:ci.name,
                                                            name:ci.name,
                                                        });
                                                        selectedMCatgs.push(ci.name);
                                                    }
                                                }); 
                                                if(subDocument3.length>0)
                                                {
                                                    Thogupu.Service.aggregate([
                                                        { $match:{"service_name":{ $in: selectedServices }}},  
                                                        { $unwind: '$system_info' },
                                                        { $match:{"system_info.system_name":{ $in: selectedSystems }}},  
                                                        { $unwind: '$system_info.item_info' },
                                                        { $match:{"system_info.item_info.item_name":{ $in: selectedItems }}},  
                                                        { $unwind: '$system_info.item_info.main_category_info' },
                                                        { $match:{"system_info.item_info.main_category_info.main_category_name":{ $in: selectedMCatgs }}},  
                                                        { $unwind: '$system_info.item_info.main_category_info.sub_category_info' },
                                                        {
                                                            $group: {
                                                                _id:{'_id':'$system_info.item_info.main_category_info.sub_category_info.sub_category_name'}
                                                            }
                                                        },
                                                        {
                                                            $project:
                                                            {
                                                                _id:0,
                                                                id:'$_id._id',
                                                                name:'$_id._id'
                                                            }
                                                        },  
                                                        {
                                                            $sort:
                                                            {
                                                                'id' :-1
                                                            }
                                                        }
                                                    ], function (err, result3) {
                                                        if (err) {
                                                            next(err);
                                                        } 
                                                        else 
                                                        {
                                                            result3.forEach(function(ci){
                                                                var index = scatgs.findIndex(x => x.name==ci.name);
                                                                if(index>=0)
                                                                {
                                                                    subDocument4.push({
                                                                        id:ci.name,
                                                                        name:ci.name,
                                                                    });
                                                                    selectedSCatgs.push(ci.name);
                                                                }
                                                            }); 
                                                            if(subDocument4.length>0)
                                                            {
                                                                Thogupu.Service.aggregate([
                                                                    { $match:{"service_name":{ $in: selectedServices }}},  
                                                                    { $unwind: '$system_info' },
                                                                    { $match:{"system_info.system_name":{ $in: selectedSystems }}},  
                                                                    { $unwind: '$system_info.item_info' },
                                                                    { $match:{"system_info.item_info.item_name":{ $in: selectedItems }}},  
                                                                    { $unwind: '$system_info.item_info.main_category_info' },
                                                                    { $match:{"system_info.item_info.main_category_info.main_category_name":{ $in: selectedMCatgs }}},  
                                                                    { $unwind: '$system_info.item_info.main_category_info.sub_category_info' },
                                                                    { $match:{"system_info.item_info.main_category_info.sub_category_info.sub_category_name":{ $in: selectedSCatgs }}},  
                                                                    { $unwind: '$system_info.item_info.main_category_info.sub_category_info.parameter_info' },
                                                                    {
                                                                        $group: {
                                                                            _id:{'_id':'$system_info.item_info.main_category_info.sub_category_info.parameter_info.parameter_name'}
                                                                        }
                                                                    },
                                                                    {
                                                                        $project:
                                                                        {
                                                                            _id:0,
                                                                            id:'$_id._id',
                                                                            name:'$_id._id'
                                                                        }
                                                                    },  
                                                                    {
                                                                        $sort:
                                                                        {
                                                                            'id' :-1
                                                                        }
                                                                    }
                                                                ], function (err, result4) {
                                                                    if (err) {
                                                                        next(err);
                                                                    } 
                                                                    else 
                                                                    {
                                                                        result4.forEach(function(ci){
                                                                            var index = paras.findIndex(x => x.name==ci.name);
                                                                            if(index>=0)
                                                                            {
                                                                                subDocument5.push({
                                                                                    id:ci.name,
                                                                                    name:ci.name,
                                                                                });
                                                                            }
                                                                        }); 
                                                                        res.status(201).json({
                                                                            selectedSystem:subDocument1,
                                                                            selectedItem:subDocument2,
                                                                            selectedMainCatg:subDocument3,
                                                                            selectedSubCatg:subDocument4,
                                                                            selectedParameter:subDocument5,
                                                                            selectedCode:subDocument6,
                                                                            systemList:result,
                                                                            itemList:result1,
                                                                            mainCatgList:result2,
                                                                            subCatgList:result3,
                                                                            parameterList:result4,
                                                                            codeList:result5
                                                                        });
                                                                    }
                                                                });
                                                            }
                                                            else
                                                            {
                                                                res.status(201).json({
                                                                    selectedSystem:subDocument1,
                                                                    selectedItem:subDocument2,
                                                                    selectedMainCatg:subDocument3,
                                                                    selectedSubCatg:[],
                                                                    selectedParameter:[],
                                                                    selectedCode:subDocument6,
                                                                    systemList:result,
                                                                    itemList:result1,
                                                                    mainCatgList:result2,
                                                                    subCatgList:result3,
                                                                    parameterList:[],
                                                                    codeList:result5
                                                                });
                                                            }
                                                        }
                                                    });
                                                }
                                                else
                                                {
                                                    res.status(201).json({
                                                        selectedSystem:subDocument1,
                                                        selectedItem:subDocument2,
                                                        selectedMainCatg:[],
                                                        selectedSubCatg:[],
                                                        selectedParameter:[],
                                                        selectedCode:subDocument6,
                                                        systemList:result,
                                                        itemList:result1,
                                                        mainCatgList:result2,
                                                        subCatgList:[],
                                                        parameterList:[],
                                                        codeList:result5
                                                    });
                                                }
                                            }
                                        });
                                    }
                                    else
                                    {
                                        res.status(201).json({
                                            selectedSystem:subDocument1,
                                            selectedItem:[],
                                            selectedMainCatg:[],
                                            selectedSubCatg:[],
                                            selectedParameter:[],
                                            selectedCode:subDocument6,
                                            systemList:result,
                                            itemList:result1,
                                            mainCatgList:[],
                                            subCatgList:[],
                                            parameterList:[],
                                            codeList:result5
                                        });
                                    }
                                }
                            });
                        }
                        else
                        {
                            res.status(201).json({
                                selectedSystem:[],
                                selectedItem:[],
                                selectedMainCatg:[],
                                selectedSubCatg:[],
                                selectedParameter:[],
                                selectedCode:subDocument6,
                                systemList:result,
                                itemList:[],
                                mainCatgList:[],
                                subCatgList:[],
                                parameterList:[],
                                codeList:result5
                            });
                        }
                    }
                });
            }
        });
    }
    else
    {
        res.status(201).json({
            selectedServices:[],
            selectedSystem:[],
            selectedItem:[],
            selectedMainCatg:[],
            selectedSubCatg:[],
            selectedParameter:[],
            selectedCode:[],
            systemList:[],
            itemList:[],
            mainCatgList:[],
            subCatgList:[],
            parameterList:[],
            codeList:[]
        });
    }
});

router.get('/qc/changeprojectsystem/:services/:systems/:items/:mcatgs/:scatgs/:paras',jwtAuth, function (req, res, next) {
    var services=JSON.parse(req.params.services);
    var systems=JSON.parse(req.params.systems);
    var items=JSON.parse(req.params.items);
    var mcatgs=JSON.parse(req.params.mcatgs);
    var scatgs=JSON.parse(req.params.scatgs);
    var paras=JSON.parse(req.params.paras);

    var selectedServices=[];
    services.forEach(function(item){
        selectedServices.push(item.name);
    });
    var selectedSystems=[];
    systems.forEach(function(item){
        selectedSystems.push(item.name);
    });
    var selectedItems=[];
    var selectedMCatgs=[];
    var selectedSCatgs=[];
        
    var subDocument2=[];
    var subDocument3=[];
    var subDocument4=[];
    var subDocument5=[];

    if(systems.length>0)
    {
        Thogupu.Service.aggregate([
            { $match:{"service_name":{ $in: selectedServices }}},  
            { $unwind: '$system_info' },
            { $match:{"system_info.system_name":{ $in: selectedSystems }}},  
            { $unwind: '$system_info.item_info' },
            {
                $group: {
                    _id:{'_id':'$system_info.item_info.item_name'}
                }
            },
            {
                $project:
                {
                    _id:0,
                    id:'$_id._id',
                    name:'$_id._id'
                }
            },  
            {
                $sort:
                {
                    'id' :-1
                }
            }
        ], function (err, result1) {
            if (err) {
                next(err);
            } 
            else 
            {
                result1.forEach(function(ci){
                    var index = items.findIndex(x => x.name==ci.name);
                    if(index>=0)
                    {
                        subDocument2.push({
                            id:ci.name,
                            name:ci.name,
                        });
                        selectedItems.push(ci.name);
                    }
                }); 
                if(subDocument2.length>0)
                {
                    Thogupu.Service.aggregate([
                        { $match:{"service_name":{ $in: selectedServices }}},  
                        { $unwind: '$system_info' },
                        { $match:{"system_info.system_name":{ $in: selectedSystems }}},  
                        { $unwind: '$system_info.item_info' },
                        { $match:{"system_info.item_info.item_name":{ $in: selectedItems }}},  
                        { $unwind: '$system_info.item_info.main_category_info' },
                        {
                            $group: {
                                _id:{'_id':'$system_info.item_info.main_category_info.main_category_name'}
                            }
                        },
                        {
                            $project:
                            {
                                _id:0,
                                id:'$_id._id',
                                name:'$_id._id'
                            }
                        },  
                        {
                            $sort:
                            {
                                'id' :-1
                            }
                        }
                    ], function (err, result2) {
                        if (err) {
                            next(err);
                        } 
                        else 
                        {
                            result2.forEach(function(ci){
                                var index = mcatgs.findIndex(x => x.name==ci.name);
                                if(index>=0)
                                {
                                    subDocument3.push({
                                        id:ci.name,
                                        name:ci.name,
                                    });
                                    selectedMCatgs.push(ci.name);
                                }
                            }); 
                            if(subDocument3.length>0)
                            {
                                Thogupu.Service.aggregate([
                                    { $match:{"service_name":{ $in: selectedServices }}},  
                                    { $unwind: '$system_info' },
                                    { $match:{"system_info.system_name":{ $in: selectedSystems }}},  
                                    { $unwind: '$system_info.item_info' },
                                    { $match:{"system_info.item_info.item_name":{ $in: selectedItems }}},  
                                    { $unwind: '$system_info.item_info.main_category_info' },
                                    { $match:{"system_info.item_info.main_category_info.main_category_name":{ $in: selectedMCatgs }}},  
                                    { $unwind: '$system_info.item_info.main_category_info.sub_category_info' },
                                    {
                                        $group: {
                                            _id:{'_id':'$system_info.item_info.main_category_info.sub_category_info.sub_category_name'}
                                        }
                                    },
                                    {
                                        $project:
                                        {
                                            _id:0,
                                            id:'$_id._id',
                                            name:'$_id._id'
                                        }
                                    },  
                                    {
                                        $sort:
                                        {
                                            'id' :-1
                                        }
                                    }
                                ], function (err, result3) {
                                    if (err) {
                                        next(err);
                                    } 
                                    else 
                                    {
                                        result3.forEach(function(ci){
                                            var index = scatgs.findIndex(x => x.name==ci.name);
                                            if(index>=0)
                                            {
                                                subDocument4.push({
                                                    id:ci.name,
                                                    name:ci.name,
                                                });
                                                selectedSCatgs.push(ci.name);
                                            }
                                        }); 
                                        if(subDocument4.length>0)
                                        {
                                            Thogupu.Service.aggregate([
                                                { $match:{"service_name":{ $in: selectedServices }}},  
                                                { $unwind: '$system_info' },
                                                { $match:{"system_info.system_name":{ $in: selectedSystems }}},  
                                                { $unwind: '$system_info.item_info' },
                                                { $match:{"system_info.item_info.item_name":{ $in: selectedItems }}},  
                                                { $unwind: '$system_info.item_info.main_category_info' },
                                                { $match:{"system_info.item_info.main_category_info.main_category_name":{ $in: selectedMCatgs }}},  
                                                { $unwind: '$system_info.item_info.main_category_info.sub_category_info' },
                                                { $match:{"system_info.item_info.main_category_info.sub_category_info.sub_category_name":{ $in: selectedSCatgs }}},  
                                                { $unwind: '$system_info.item_info.main_category_info.sub_category_info.parameter_info' },
                                                {
                                                    $group: {
                                                        _id:{'_id':'$system_info.item_info.main_category_info.sub_category_info.parameter_info.parameter_name'}
                                                    }
                                                },
                                                {
                                                    $project:
                                                    {
                                                        _id:0,
                                                        id:'$_id._id',
                                                        name:'$_id._id'
                                                    }
                                                },  
                                                {
                                                    $sort:
                                                    {
                                                        'id' :-1
                                                    }
                                                }
                                            ], function (err, result4) {
                                                if (err) {
                                                    next(err);
                                                } 
                                                else 
                                                {
                                                    result4.forEach(function(ci){
                                                        var index = paras.findIndex(x => x.name==ci.name);
                                                        if(index>=0)
                                                        {
                                                            subDocument5.push({
                                                                id:ci.name,
                                                                name:ci.name,
                                                            });
                                                        }
                                                    }); 
                                                    res.status(201).json({
                                                        selectedItem:subDocument2,
                                                        selectedMainCatg:subDocument3,
                                                        selectedSubCatg:subDocument4,
                                                        selectedParameter:subDocument5,
                                                        itemList:result1,
                                                        mainCatgList:result2,
                                                        subCatgList:result3,
                                                        parameterList:result4
                                                    });
                                                }
                                            });
                                        }
                                        else
                                        {
                                            res.status(201).json({
                                                selectedItem:subDocument2,
                                                selectedMainCatg:subDocument3,
                                                selectedSubCatg:[],
                                                selectedParameter:[],
                                                itemList:result1,
                                                mainCatgList:result2,
                                                subCatgList:result3,
                                                parameterList:[]
                                            });
                                        }
                                    }
                                });
                            }
                            else
                            {
                                res.status(201).json({
                                    selectedItem:subDocument2,
                                    selectedMainCatg:[],
                                    selectedSubCatg:[],
                                    selectedParameter:[],
                                    itemList:result1,
                                    mainCatgList:result2,
                                    subCatgList:[],
                                    parameterList:[]
                                });
                            }
                        }
                    });
                }
                else
                {
                    res.status(201).json({
                        selectedItem:[],
                        selectedMainCatg:[],
                        selectedSubCatg:[],
                        selectedParameter:[],
                        itemList:result1,
                        mainCatgList:[],
                        subCatgList:[],
                        parameterList:[]
                    });
                }
            }
        });
    }
    else
    {
        res.status(201).json({
            selectedItem:[],
            selectedMainCatg:[],
            selectedSubCatg:[],
            selectedParameter:[],
            itemList:[],
            mainCatgList:[],
            subCatgList:[],
            parameterList:[]
        });
    }
});

router.get('/qc/changeprojectitem/:services/:systems/:items/:mcatgs/:scatgs/:paras',jwtAuth, function (req, res, next) {
    var services=JSON.parse(req.params.services);
    var systems=JSON.parse(req.params.systems);
    var items=JSON.parse(req.params.items);
    var mcatgs=JSON.parse(req.params.mcatgs);
    var scatgs=JSON.parse(req.params.scatgs);
    var paras=JSON.parse(req.params.paras);

    var selectedServices=[];
    services.forEach(function(item){
        selectedServices.push(item.name);
    });
    var selectedSystems=[];
    systems.forEach(function(item){
        selectedSystems.push(item.name);
    });
    var selectedItems=[];
    items.forEach(function(item){
        selectedItems.push(item.name);
    });
    var selectedMCatgs=[];
    var selectedSCatgs=[];      
    
    var subDocument3=[];
    var subDocument4=[];
    var subDocument5=[];

    if(items.length>0)
    {
        Thogupu.Service.aggregate([
            { $match:{"service_name":{ $in: selectedServices }}},  
            { $unwind: '$system_info' },
            { $match:{"system_info.system_name":{ $in: selectedSystems }}},  
            { $unwind: '$system_info.item_info' },
            { $match:{"system_info.item_info.item_name":{ $in: selectedItems }}},  
            { $unwind: '$system_info.item_info.main_category_info' },
            {
                $group: {
                    _id:{'_id':'$system_info.item_info.main_category_info.main_category_name'}
                }
            },
            {
                $project:
                {
                    _id:0,
                    id:'$_id._id',
                    name:'$_id._id'
                }
            },  
            {
                $sort:
                {
                    'id' :-1
                }
            }
        ], function (err, result2) {
            if (err) {
                next(err);
            } 
            else 
            {
                result2.forEach(function(ci){
                    var index = mcatgs.findIndex(x => x.name==ci.name);
                    if(index>=0)
                    {
                        subDocument3.push({
                            id:ci.name,
                            name:ci.name,
                        });
                        selectedMCatgs.push(ci.name);
                    }
                }); 
                if(subDocument3.length>0)
                {
                    Thogupu.Service.aggregate([
                        { $match:{"service_name":{ $in: selectedServices }}},  
                        { $unwind: '$system_info' },
                        { $match:{"system_info.system_name":{ $in: selectedSystems }}},  
                        { $unwind: '$system_info.item_info' },
                        { $match:{"system_info.item_info.item_name":{ $in: selectedItems }}},  
                        { $unwind: '$system_info.item_info.main_category_info' },
                        { $match:{"system_info.item_info.main_category_info.main_category_name":{ $in: selectedMCatgs }}},  
                        { $unwind: '$system_info.item_info.main_category_info.sub_category_info' },
                        {
                            $group: {
                                _id:{'_id':'$system_info.item_info.main_category_info.sub_category_info.sub_category_name'}
                            }
                        },
                        {
                            $project:
                            {
                                _id:0,
                                id:'$_id._id',
                                name:'$_id._id'
                            }
                        },  
                        {
                            $sort:
                            {
                                'id' :-1
                            }
                        }
                    ], function (err, result3) {
                        if (err) {
                            next(err);
                        } 
                        else 
                        {
                            result3.forEach(function(ci){
                                var index = scatgs.findIndex(x => x.name==ci.name);
                                if(index>=0)
                                {
                                    subDocument4.push({
                                        id:ci.name,
                                        name:ci.name,
                                    });
                                    selectedSCatgs.push(ci.name);
                                }
                            }); 
                            if(subDocument4.length>0)
                            {
                                Thogupu.Service.aggregate([
                                    { $match:{"service_name":{ $in: selectedServices }}},  
                                    { $unwind: '$system_info' },
                                    { $match:{"system_info.system_name":{ $in: selectedSystems }}},  
                                    { $unwind: '$system_info.item_info' },
                                    { $match:{"system_info.item_info.item_name":{ $in: selectedItems }}},  
                                    { $unwind: '$system_info.item_info.main_category_info' },
                                    { $match:{"system_info.item_info.main_category_info.main_category_name":{ $in: selectedMCatgs }}},  
                                    { $unwind: '$system_info.item_info.main_category_info.sub_category_info' },
                                    { $match:{"system_info.item_info.main_category_info.sub_category_info.sub_category_name":{ $in: selectedSCatgs }}},  
                                    { $unwind: '$system_info.item_info.main_category_info.sub_category_info.parameter_info' },
                                    {
                                        $group: {
                                            _id:{'_id':'$system_info.item_info.main_category_info.sub_category_info.parameter_info.parameter_name'}
                                        }
                                    },
                                    {
                                        $project:
                                        {
                                            _id:0,
                                            id:'$_id._id',
                                            name:'$_id._id'
                                        }
                                    },  
                                    {
                                        $sort:
                                        {
                                            'id' :-1
                                        }
                                    }
                                ], function (err, result4) {
                                    if (err) {
                                        next(err);
                                    } 
                                    else 
                                    {
                                        result4.forEach(function(ci){
                                            var index = paras.findIndex(x => x.name==ci.name);
                                            if(index>=0)
                                            {
                                                subDocument5.push({
                                                    id:ci.name,
                                                    name:ci.name,
                                                });
                                            }
                                        }); 
                                        res.status(201).json({
                                            selectedMainCatg:subDocument3,
                                            selectedSubCatg:subDocument4,
                                            selectedParameter:subDocument5,
                                            mainCatgList:result2,
                                            subCatgList:result3,
                                            parameterList:result4
                                        });
                                    }
                                });
                            }
                            else
                            {
                                res.status(201).json({
                                    selectedMainCatg:subDocument3,
                                    selectedSubCatg:[],
                                    selectedParameter:[],
                                    mainCatgList:result2,
                                    subCatgList:result3,
                                    parameterList:[]
                                });
                            }
                        }
                    });
                }
                else
                {
                    res.status(201).json({
                        selectedMainCatg:[],
                        selectedSubCatg:[],
                        selectedParameter:[],
                        mainCatgList:result2,
                        subCatgList:[],
                        parameterList:[]
                    });
                }
            }
        });
    }
    else
    {
        res.status(201).json({
            selectedMainCatg:[],
            selectedSubCatg:[],
            selectedParameter:[],
            mainCatgList:[],
            subCatgList:[],
            parameterList:[]
        });
    }    
});

router.get('/qc/changeprojectmaincatg/:services/:systems/:items/:mcatgs/:scatgs/:paras',jwtAuth, function (req, res, next) {
    var services=JSON.parse(req.params.services);
    var systems=JSON.parse(req.params.systems);
    var items=JSON.parse(req.params.items);
    var mcatgs=JSON.parse(req.params.mcatgs);
    var scatgs=JSON.parse(req.params.scatgs);
    var paras=JSON.parse(req.params.paras);

    var selectedServices=[];
    services.forEach(function(item){
        selectedServices.push(item.name);
    });
    var selectedSystems=[];
    systems.forEach(function(item){
        selectedSystems.push(item.name);
    });
    var selectedItems=[];
    items.forEach(function(item){
        selectedItems.push(item.name);
    });
    var selectedMCatgs=[];
    mcatgs.forEach(function(item){
        selectedMCatgs.push(item.name);
    });
    var selectedSCatgs=[];        
    
    var subDocument4=[];
    var subDocument5=[];

    if(mcatgs.length>0)
    {
        Thogupu.Service.aggregate([
            { $match:{"service_name":{ $in: selectedServices }}},  
            { $unwind: '$system_info' },
            { $match:{"system_info.system_name":{ $in: selectedSystems }}},  
            { $unwind: '$system_info.item_info' },
            { $match:{"system_info.item_info.item_name":{ $in: selectedItems }}},  
            { $unwind: '$system_info.item_info.main_category_info' },
            { $match:{"system_info.item_info.main_category_info.main_category_name":{ $in: selectedMCatgs }}},  
            { $unwind: '$system_info.item_info.main_category_info.sub_category_info' },
            {
                $group: {
                    _id:{'_id':'$system_info.item_info.main_category_info.sub_category_info.sub_category_name'}
                }
            },
            {
                $project:
                {
                    _id:0,
                    id:'$_id._id',
                    name:'$_id._id'
                }
            },  
            {
                $sort:
                {
                    'id' :-1
                }
            }
        ], function (err, result3) {
            if (err) {
                next(err);
            } 
            else 
            {
                result3.forEach(function(ci){
                    var index = scatgs.findIndex(x => x.name==ci.name);
                    if(index>=0)
                    {
                        subDocument4.push({
                            id:ci.name,
                            name:ci.name,
                        });
                        selectedSCatgs.push(ci.name);
                    }
                }); 
                if(subDocument4.length>0)
                {
                    Thogupu.Service.aggregate([
                        { $match:{"service_name":{ $in: selectedServices }}},  
                        { $unwind: '$system_info' },
                        { $match:{"system_info.system_name":{ $in: selectedSystems }}},  
                        { $unwind: '$system_info.item_info' },
                        { $match:{"system_info.item_info.item_name":{ $in: selectedItems }}},  
                        { $unwind: '$system_info.item_info.main_category_info' },
                        { $match:{"system_info.item_info.main_category_info.main_category_name":{ $in: selectedMCatgs }}},  
                        { $unwind: '$system_info.item_info.main_category_info.sub_category_info' },
                        { $match:{"system_info.item_info.main_category_info.sub_category_info.sub_category_name":{ $in: selectedSCatgs }}},  
                        { $unwind: '$system_info.item_info.main_category_info.sub_category_info.parameter_info' },
                        {
                            $group: {
                                _id:{'_id':'$system_info.item_info.main_category_info.sub_category_info.parameter_info.parameter_name'}
                            }
                        },
                        {
                            $project:
                            {
                                _id:0,
                                id:'$_id._id',
                                name:'$_id._id'
                            }
                        },  
                        {
                            $sort:
                            {
                                'id' :-1
                            }
                        }
                    ], function (err, result4) {
                        if (err) {
                            next(err);
                        } 
                        else 
                        {
                            result4.forEach(function(ci){
                                var index = paras.findIndex(x => x.name==ci.name);
                                if(index>=0)
                                {
                                    subDocument5.push({
                                        id:ci.name,
                                        name:ci.name,
                                    });
                                }
                            }); 
                            res.status(201).json({
                                selectedSubCatg:subDocument4,
                                selectedParameter:subDocument5,
                                subCatgList:result3,
                                parameterList:result4
                            });
                        }
                    });
                }
                else
                {
                    res.status(201).json({
                        selectedSubCatg:[],
                        selectedParameter:[],
                        subCatgList:result3,
                        parameterList:[]
                    });
                }
            }
        });
    }
    else
    {
        res.status(201).json({
            selectedSubCatg:[],
            selectedParameter:[],
            subCatgList:[],
            parameterList:[]
        });
    }
});

router.get('/qc/changeprojectsubcatg/:services/:systems/:items/:mcatgs/:scatgs/:paras',jwtAuth, function (req, res, next) {
    var services=JSON.parse(req.params.services);
    var systems=JSON.parse(req.params.systems);
    var items=JSON.parse(req.params.items);
    var mcatgs=JSON.parse(req.params.mcatgs);
    var scatgs=JSON.parse(req.params.scatgs);
    var paras=JSON.parse(req.params.paras);

    var selectedServices=[];
    services.forEach(function(item){
        selectedServices.push(item.name);
    });
    var selectedSystems=[];
    systems.forEach(function(item){
        selectedSystems.push(item.name);
    });
    var selectedItems=[];
    items.forEach(function(item){
        selectedItems.push(item.name);
    });
    var selectedMCatgs=[];
    mcatgs.forEach(function(item){
        selectedMCatgs.push(item.name);
    });
    var selectedSCatgs=[];
    scatgs.forEach(function(item){
        selectedSCatgs.push(item.name);
    });     
   
    var subDocument5=[];
    if(scatgs.length>0)
    {
        Thogupu.Service.aggregate([
            { $match:{"service_name":{ $in: selectedServices }}},  
            { $unwind: '$system_info' },
            { $match:{"system_info.system_name":{ $in: selectedSystems }}},  
            { $unwind: '$system_info.item_info' },
            { $match:{"system_info.item_info.item_name":{ $in: selectedItems }}},  
            { $unwind: '$system_info.item_info.main_category_info' },
            { $match:{"system_info.item_info.main_category_info.main_category_name":{ $in: selectedMCatgs }}},  
            { $unwind: '$system_info.item_info.main_category_info.sub_category_info' },
            { $match:{"system_info.item_info.main_category_info.sub_category_info.sub_category_name":{ $in: selectedSCatgs }}},  
            { $unwind: '$system_info.item_info.main_category_info.sub_category_info.parameter_info' },
            {
                $group: {
                    _id:{'_id':'$system_info.item_info.main_category_info.sub_category_info.parameter_info.parameter_name'}
                }
            },
            {
                $project:
                {
                    _id:0,
                    id:'$_id._id',
                    name:'$_id._id'
                }
            },  
            {
                $sort:
                {
                    'id' :-1
                }
            }
        ], function (err, result4) {
            if (err) {
                next(err);
            } 
            else 
            {
                result4.forEach(function(ci){
                    var index = paras.findIndex(x => x.name==ci.name);
                    if(index>=0)
                    {
                        subDocument5.push({
                            id:ci.name,
                            name:ci.name,
                        });
                    }
                }); 
                res.status(201).json({
                    selectedParameter:subDocument5,
                    parameterList:result4
                });
            }
        });
    }
    else
    {
        res.status(201).json({
            selectedParameter:[],
            parameterList:[]
        });
    }   
});

router.get('/qc/getdeliverablelist/:pid',jwtAuth, function (req, res, next) {
    QC.Project.aggregate([
        { $match:{"_id":{ $eq: ObjectId(req.params.pid) }}},    
        { $unwind: '$revision_info' },
        {
            $group:
            {
                _id: {'_id':'$revision_info._id','revision_name':'$revision_info.revision_name'}
            }
        },
        {
            $project:
            {
                _id:'$_id._id',
                revision_name:'$_id.revision_name'
            }
        },
        {
            $sort:{
                _id:1
            }
        }
    ], function (err, result1) {
        if (err) {
            next(err);
        } 
        else 
        {
            QC.Project.aggregate([
                { $match:{"_id":{ $eq: ObjectId(req.params.pid) }}},    
                { $unwind: '$revision_info' },
                {
                    $group:
                    {
                        _id: {'_id':'$project_name'},
                        lastrevision: { $last: "$revision_info" } 
                    }
                },
                { $unwind: '$lastrevision' },
                { $unwind: '$lastrevision.deliverable_info' },
                { $match:{"lastrevision.deliverable_info.deliverable_status":{ $ne: "draft" }}},
                { $unwind: '$lastrevision.deliverable_info.review_info' },
                {
                    $group:
                    {
                        _id: {'_id':'$lastrevision.deliverable_info._id','drawing_number':'$lastrevision.deliverable_info.drawing_number','drawing_title':'$lastrevision.deliverable_info.drawing_title','delivered_date':'$lastrevision.deliverable_info.delivered_date','team_leader':'$lastrevision.deliverable_info.team_leader','service_engineer':'$lastrevision.deliverable_info.service_engineer','deliverable_status':'$lastrevision.deliverable_info.deliverable_status','checkpoint_exsit':'$lastrevision.deliverable_info.checkpoint_exsit'},
                        lastreview: { $last: "$lastrevision.deliverable_info.review_info" } 
                    }
                },
                { $unwind: '$lastreview' },
                {
                    $group:
                    {
                        _id: {'_id':'$_id._id','drawing_number':'$_id.drawing_number','drawing_title':'$_id.drawing_title','delivered_date':'$_id.delivered_date','team_leader':'$_id.team_leader','service_engineer':'$_id.service_engineer','deliverable_status':'$_id.deliverable_status','checkpoint_exsit':'$_id.checkpoint_exsit','review_id':'$lastreview._id','review_name':'$lastreview.review_name'},
                    }
                },
                {
                    $project:
                    {
                        _id:'$_id._id',
                        drawing_number:'$_id.drawing_number',
                        drawing_title:'$_id.drawing_title',
                        delivered_date:'$_id.delivered_date',
                        team_leader:'$_id.team_leader',
                        service_engineer:'$_id.service_engineer',
                        deliverable_status:'$_id.deliverable_status',
                        checkpoint_exsit:'$_id.checkpoint_exsit',
                        review_id:'$_id.review_id',
                        review_name:'$_id.review_name'
                    }
                }
            ], function (err, result2) {
                if (err) {
                    next(err);
                } 
                else 
                {
                    res.status(201).json({
                        revisionList:result1,
                        deliverableList:result2
                    }); 
                }
            });
        }
    });
});

router.get('/qc/saveprojectmember/:pid/:acclvel/:members',jwtAuth, function (req, res, next) {
    QC.Project.findById(ObjectId(req.params.pid),function(err, data){  
        var members=JSON.parse(req.params.members);
        if(req.params.acclvel=='Team Leader')
        {
            members.forEach(function(item){
                data.leader_info.push({
                    '_id':new ObjectId(),
                    user_name:item.name,
                    email_id:item.email_id
                });
            });
        }
        else if(req.params.acclvel=='Engineer')
        {
            members.forEach(function(item){
                data.engineers_info.push({
                    '_id':new ObjectId(),
                    user_name:item.name,
                    email_id:item.email_id
                });
            });
        }
        data.save(function(err, result) { 
            if (err) {
                return res.status(500).json({
                    title: 'An error occurred',
                    error: err
                });
            }
            else
            {
                res.status(201).json({
                    engineers_info:data.engineers_info,
                    leader_info:data.leader_info
                });
            }
        });
    });
});

router.get('/qc/changedeliverableinfo/:pid/:rid/:did/:fieldname/:fieldval/:emailid',jwtAuth, function (req, res, next) {
    QC.Project.findById(ObjectId(req.params.pid),function(err, data){  
        var t=data.revision_info.id(ObjectId(req.params.rid)).deliverable_info.id(ObjectId(req.params.did));

        if(req.params.fieldname=='Team Leader')
        {
            t.team_leader=req.params.fieldval;
            t.leader_email=req.params.emailid;
        }
        else if(req.params.fieldname=='Engineer')
        {
            t.service_engineer=req.params.fieldval;
            t.engineer_email=req.params.emailid;
        }
        t.team_manager=req.userName;
        t.manager_email=req.userEmail;
        data.save(function(err, result) { 
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

router.get('/qc/getdeliverabledetail/:pid/:rid/:did/:reviewid',jwtAuth, function (req, res, next) {
    QC.Project.findById(ObjectId(req.params.pid),function(err, data){  
        var t=data.revision_info.id(ObjectId(req.params.rid)).deliverable_info.id(ObjectId(req.params.did));
        
        var subDocument1=[];
        var subDocument2=[];
        var subDocument3=[];
        var subDocument4=[];
        var subDocument5=[];
        var subDocument6=[];
        var subDocument7=[];
        var subDocument8=[];
        var subDocument9=[];
        var subDocument10=[];
        var subDocument11=[];
        var subDocument12=[];
        var subDocument13=[];
        var subDocument14=[];

        if(t.is_client_specific)
        {
            subDocument3.push({
                id:t.client_name,
                name:t.client_name
            })
        }

        if(t.deliverable_services.length>0)
        {
            t.deliverable_services.forEach(function(item){
                subDocument1.push({
                    id:item.service_name,
                    name:item.service_name
                });
                subDocument10.push(item.service_name);
            });
            
            subDocument2.push({
                id:t.deliverable_category,
                name:t.deliverable_category
            });

            if(t.deliverable_subcategory.length>0)
            {
                t.deliverable_subcategory.forEach(function(item){
                    subDocument4.push({
                        id:item.deliverable_sub_category,
                        name:item.deliverable_sub_category
                    });
                });
            }

            if(t.deliverable_systems.length>0)
            {
                t.deliverable_systems.forEach(function(item){
                    subDocument5.push({
                        id:item.system_name,
                        name:item.system_name
                    });
                });
                if(t.deliverable_items.length>0)
                {
                    t.deliverable_items.forEach(function(item){
                        subDocument6.push({
                            id:item.item_name,
                            name:item.item_name
                        });
                    });
                    if(t.deliverable_main_category.length>0)
                    {
                        t.deliverable_main_category.forEach(function(item){
                            subDocument7.push({
                                id:item.main_category_name,
                                name:item.main_category_name
                            });
                        });
                        if(t.deliverable_sub_category.length>0)
                        {
                            t.deliverable_sub_category.forEach(function(item){
                                subDocument8.push({
                                    id:item.sub_category_name,
                                    name:item.sub_category_name
                                });
                            });
                        }
                    }
                }
            }
            if(t.deliverable_codes.length>0)
            {
                t.deliverable_codes.forEach(function(item){
                    subDocument9.push({
                        id:item.code_name,
                        name:item.code_name,
                    });
                });
            }
        }

        var t1=data.revision_info.id(ObjectId(req.params.rid));

        var project_services=[];
        var project_systems=[];
        var project_items=[];
        var project_main_category=[];
        var project_sub_category=[];

        t1.project_services.forEach(function(item){
            project_services.push({
                id:item.service_name,
                name:item.service_name
            });
        });

        if(t.deliverable_services.length>0)
        {
            Thogupu.Service.aggregate([
                { $match:{"service_name":{ $in: subDocument10 }}},  
                { $unwind: '$system_info' },
                {
                    $group: {
                        _id:{'_id':'$system_info._id','system_name':'$system_info.system_name'}
                    }
                },
                {
                    $project:
                    {
                        _id:0,
                        id:'$_id._id',
                        name:'$_id.system_name'
                    }
                },  
                {
                    $sort:
                    {
                        'id' :-1
                    }
                }
            ], function (err, result1) {
                if (err) {
                    next(err);
                } 
                else 
                {
                    t1.project_systems.forEach(function(item){
                        var index = result1.findIndex(x => x.name==item.system_name);
                        if(index>=0)
                        {
                            project_systems.push({
                                id:item.system_name,
                                name:item.system_name
                            });
                            subDocument11.push(item.system_name);
                        }
                    });

                    if(t.deliverable_systems.length>0)
                    {
                        Thogupu.Service.aggregate([
                            { $match:{"service_name":{ $in: subDocument10 }}},  
                            { $unwind: '$system_info' },
                            { $match:{"system_info.system_name":{ $in: subDocument11 }}},  
                            { $unwind: '$system_info.item_info' },
                            {
                                $group: {
                                    _id:{'_id':'$system_info.item_info._id','item_name':'$system_info.item_info.item_name'}
                                }
                            },
                            {
                                $project:
                                {
                                    _id:0,
                                    id:'$_id._id',
                                    name:'$_id.item_name'
                                }
                            },  
                            {
                                $sort:
                                {
                                    'id' :-1
                                }
                            }
                        ], function (err, result2) {
                            if (err) {
                                next(err);
                            } 
                            else 
                            {
                                t1.project_items.forEach(function(item){
                                    var index = result2.findIndex(x => x.name==item.item_name);
                                    if(index>=0)
                                    {
                                        project_items.push({
                                            id:item.item_name,
                                            name:item.item_name
                                        });
                                        subDocument12.push(item.item_name);
                                    }
                                });
                                if(t.deliverable_items.length>0)
                                {
                                    Thogupu.Service.aggregate([
                                        { $match:{"service_name":{ $in: subDocument10 }}},  
                                        { $unwind: '$system_info' },
                                        { $match:{"system_info.system_name":{ $in: subDocument11 }}},  
                                        { $unwind: '$system_info.item_info' },
                                        { $match:{"system_info.item_info.item_name":{ $in: subDocument12 }}},  
                                        { $unwind: '$system_info.item_info.main_category_info' },
                                        {
                                            $group: {
                                                _id:{'_id':'$system_info.item_info.main_category_info._id','main_category_name':'$system_info.item_info.main_category_info.main_category_name'}
                                            }
                                        },
                                        {
                                            $project:
                                            {
                                                _id:0,
                                                id:'$_id._id',
                                                name:'$_id.main_category_name'
                                            }
                                        },  
                                        {
                                            $sort:
                                            {
                                                'id' :-1
                                            }
                                        }
                                    ], function (err, result3) {
                                        if (err) {
                                            next(err);
                                        } 
                                        else 
                                        {
                                            t1.project_main_category.forEach(function(item){
                                                var index = result3.findIndex(x => x.name==item.main_category_name);
                                                if(index>=0)
                                                {
                                                    project_main_category.push({
                                                        id:item.main_category_name,
                                                        name:item.main_category_name
                                                    });
                                                    subDocument13.push(item.main_category_name);
                                                }
                                            });
                                            if(t.deliverable_main_category.length>0)
                                            {
                                                Thogupu.Service.aggregate([
                                                    { $match:{"service_name":{ $in: subDocument10 }}},  
                                                    { $unwind: '$system_info' },
                                                    { $match:{"system_info.system_name":{ $in: subDocument11 }}},  
                                                    { $unwind: '$system_info.item_info' },
                                                    { $match:{"system_info.item_info.item_name":{ $in: subDocument12 }}},  
                                                    { $unwind: '$system_info.item_info.main_category_info' },
                                                    { $match:{"system_info.item_info.main_category_info.main_category_name":{ $in: subDocument13 }}},  
                                                    { $unwind: '$system_info.item_info.main_category_info.sub_category_info' },
                                                    {
                                                        $group: {
                                                            _id:{'_id':'$system_info.item_info.main_category_info.sub_category_info._id','sub_category_name':'$system_info.item_info.main_category_info.sub_category_info.sub_category_name'}
                                                        }
                                                    },
                                                    {
                                                        $project:
                                                        {
                                                            _id:0,
                                                            id:'$_id._id',
                                                            name:'$_id.sub_category_name'
                                                        }
                                                    },  
                                                    {
                                                        $sort:
                                                        {
                                                            'id' :-1
                                                        }
                                                    }
                                                ], function (err, result4) {
                                                    if (err) {
                                                        next(err);
                                                    } 
                                                    else 
                                                    {
                                                        t1.project_sub_category.forEach(function(item){
                                                            var index = result4.findIndex(x => x.name==item.sub_category_name);
                                                            if(index>=0)
                                                            {
                                                                project_sub_category.push({
                                                                    id:item.sub_category_name,
                                                                    name:item.sub_category_name
                                                                });
                                                            }
                                                        });
                                                        res.status(201).json({
                                                            deliverable_reference:t.deliverable_reference,
                                                            deliverable_description:t.deliverable_description,
                                                            is_client_specific:t.is_client_specific,
                                                            client_name:subDocument3,
                                                            created_date:t.created_date, 
                                                            deliverable_services:subDocument1,
                                                            deliverable_category:subDocument2,
                                                            deliverable_sub_category:subDocument4,
                                                            deliverable_systems:subDocument5,
                                                            deliverable_items:subDocument6,
                                                            deliverable_main_category:subDocument7,
                                                            deliverable_sub_category:subDocument8,
                                                            deliverable_codes:subDocument9,
                                                            project_services:project_services,
                                                            project_systems:project_systems,
                                                            project_items:project_items,
                                                            project_main_category:project_main_category,
                                                            project_sub_category:project_sub_category
                                                        }); 
                                                    }
                                                });
                                            }
                                            else
                                            {
                                                res.status(201).json({
                                                    deliverable_reference:t.deliverable_reference,
                                                    deliverable_description:t.deliverable_description,
                                                    is_client_specific:t.is_client_specific,
                                                    client_name:subDocument3,
                                                    created_date:t.created_date, 
                                                    deliverable_services:subDocument1,
                                                    deliverable_category:subDocument2,
                                                    deliverable_subcategory:subDocument4,
                                                    deliverable_systems:subDocument5,
                                                    deliverable_items:subDocument6,
                                                    deliverable_main_category:subDocument7,
                                                    deliverable_sub_category:subDocument8,
                                                    deliverable_codes:subDocument9,
                                                    project_services:project_services,
                                                    project_systems:project_systems,
                                                    project_items:project_items,
                                                    project_main_category:project_main_category,
                                                    project_sub_category:[]
                                                }); 
                                            }
                                        }
                                    });
                                }
                                else
                                {
                                    res.status(201).json({
                                        deliverable_reference:t.deliverable_reference,
                                        deliverable_description:t.deliverable_description,
                                        is_client_specific:t.is_client_specific,
                                        client_name:subDocument3,
                                        created_date:t.created_date, 
                                        deliverable_services:subDocument1,
                                        deliverable_category:subDocument2,
                                        deliverable_subcategory:subDocument4,
                                        deliverable_systems:subDocument5,
                                        deliverable_items:subDocument6,
                                        deliverable_main_category:subDocument7,
                                        deliverable_sub_category:subDocument8,
                                        deliverable_codes:subDocument9,
                                        project_services:project_services,
                                        project_systems:project_systems,
                                        project_items:project_items,
                                        project_main_category:[],
                                        project_sub_category:[]
                                    }); 
                                }
                            }
                        });
                    }
                    else
                    {
                        res.status(201).json({
                            deliverable_reference:t.deliverable_reference,
                            deliverable_description:t.deliverable_description,
                            is_client_specific:t.is_client_specific,
                            client_name:subDocument3,
                            created_date:t.created_date, 
                            deliverable_services:subDocument1,
                            deliverable_category:subDocument2,
                            deliverable_subcategory:subDocument4,
                            deliverable_systems:subDocument5,
                            deliverable_items:subDocument6,
                            deliverable_main_category:subDocument7,
                            deliverable_sub_category:subDocument8,
                            deliverable_codes:subDocument9,
                            project_services:project_services,
                            project_systems:project_systems,
                            project_items:[],
                            project_main_category:[],
                            project_sub_category:[]
                        }); 
                    }
                }
            });
        }
        else
        {
            res.status(201).json({
                deliverable_reference:t.deliverable_reference,
                deliverable_description:t.deliverable_description,
                is_client_specific:t.is_client_specific,
                client_name:subDocument3,
                created_date:t.created_date, 
                deliverable_services:subDocument1,
                deliverable_category:subDocument2,
                deliverable_subcategory:subDocument4,
                deliverable_systems:subDocument5,
                deliverable_items:subDocument6,
                deliverable_main_category:subDocument7,
                deliverable_sub_category:subDocument8,
                deliverable_codes:subDocument9,
                project_services:project_services,
                project_systems:[],
                project_items:[],
                project_main_category:[],
                project_sub_category:[]
            }); 
        }
    });
});


router.get('/qc/duplicatedeliverable/:pid/:rid/:did',jwtAuth, function (req, res, next) {
    QC.Project.findById(ObjectId(req.params.pid),function(err, data){  
        var t1=data.revision_info.id(ObjectId(req.params.rid)).deliverable_info;
        var t=t1.id(ObjectId(req.params.did));
        var selectedDelSubCategory=[];
        if(t.deliverable_subcategory.length>0)
        {
            t.deliverable_subcategory.forEach(function(item){
                selectedDelSubCategory.push({
                    '_id':new ObjectId(),
                    deliverable_sub_category:item.deliverable_sub_category
                });
            });
        }

        var selectedService=[];
        if(t.deliverable_services.length>0)
        {
            t.deliverable_services.forEach(function(item){
                selectedService.push({
                    '_id':new ObjectId(),
                    service_name:item.service_name
                });
            });
        }

        var selectedSystem=[];
        if(t.deliverable_systems.length>0)
        {
            t.deliverable_systems.forEach(function(item){
                selectedSystem.push({
                    '_id':new ObjectId(),
                    system_name:item.system_name
                });
            });
        }

        var selectedItem=[];
        if(t.deliverable_items.length>0)
        {
            t.deliverable_items.forEach(function(item){
                selectedItem.push({
                    '_id':new ObjectId(),
                    item_name:item.item_name
                });
            });
        }

        var selectedMainCatg=[];
        if(t.deliverable_main_category.length>0)
        {
            t.deliverable_main_category.forEach(function(item){
                selectedMainCatg.push({
                    '_id':new ObjectId(),
                    main_category_name:item.main_category_name
                });
            });
        }

        var selectedSubCatg=[];
        if(t.deliverable_sub_category.length>0)
        {
            t.deliverable_sub_category.forEach(function(item){
                selectedSubCatg.push({
                    '_id':new ObjectId(),
                    sub_category_name:item.sub_category_name
                });
            });
        }

        var selectedParameter=[];
        if(t.deliverable_parameter.length>0)
        {
            t.deliverable_parameter.forEach(function(item){
                selectedParameter.push({
                    '_id':new ObjectId(),
                    parameter_name:item.parameter_name
                });
            });
        }

        var selectedCode=[];
        if(t.deliverable_codes.length>0)
        {
            t.deliverable_codes.forEach(function(item){
                selectedCode.push({
                    '_id':new ObjectId(),
                    code_name:item.code_name
                });
            });
        }

        var selfqcinfo=t.review_info[t.review_info.length-1].self_qc_info;
        var subDocument=[];
        selfqcinfo.forEach(function(item){
            var impacts=[];
            var services=[];
            var systems=[];
            var items=[];
            var mcatgs=[];
            var scatgs=[];
            var parameters=[];
            var codes=[];
            var noteInfo=[];

            item.error_impact.forEach(function(im){
                impacts.push({
                    '_id':new ObjectId(),
                    type_name:im.type_name
                });
            });

            item.service_info.forEach(function(s){
                services.push({
                    '_id':new ObjectId(),
                    service_name:s.service_name
                });
            });

            item.system_info.forEach(function(si){
                systems.push({
                    '_id':new ObjectId(),
                    system_name:si.system_name
                });
            });

            item.item_info.forEach(function(ii){
                items.push({
                    '_id':new ObjectId(),
                    item_name:ii.item_name
                });
            });

            item.main_category_info.forEach(function(mi){
                mcatgs.push({
                    '_id':new ObjectId(),
                    main_category_name:mi.main_category_name
                });
            });

            item.sub_category_info.forEach(function(sc){
                scatgs.push({
                    '_id':new ObjectId(),
                    sub_category_name:sc.sub_category_name
                });
            });

            item.parameter_info.forEach(function(pi){
                parameters.push({
                    '_id':new ObjectId(),
                    parameter_name:pi.parameter_name
                });
            });

            item.code_info.forEach(function(ci){
                codes.push({
                    '_id':new ObjectId(),
                    code_name:ci.code_name
                });
            });

            item.notes_info.forEach(function(item2){
                var fileInfo=[];
                item2.file_info.forEach(function(item1){
                    fileInfo.push({
                        '_id':new ObjectId(),
                        file_url:item1.file_url,
                        file_type:item1.file_type,
                    }); 
                });
                noteInfo.push({
                    '_id':new ObjectId(),
                    notes_desc:item2.notes_desc,
                    created_by:item2.created_by,
                    created_date:item2.created_date,
                    file_info:fileInfo
                });
            });

            subDocument.push({
                '_id':new ObjectId(),
                check_point_name:item.checkpoint_name,
                error_class:item.error_class,
                error_impact:impacts,
                check_point_from:item.check_point_from,
                created_by:item.created_by,
                mismatch_answer:'',
                qe_answer:'',
                se_answer:'',
                service_info:services,
                system_info:systems,
                item_info:items,
                main_category_info:mcatgs,
                sub_category_info:scatgs,
                parameter_info:parameters,
                code_info:codes,
                notes_info:noteInfo,
                cp_remarks:'',
                cp_comments:''
            });
        });

        t1.push({
            '_id':new ObjectId(),
            drawing_number:t.drawing_number,
            drawing_title:t.drawing_title,
            deliverable_reference:t.deliverable_reference,
            deliverable_description:t.deliverable_description,
            deliverable_category:t.is_client_specific,
            deliverable_subcategory:selectedDelSubCategory,
            is_client_specific:t.is_client_specific,
            client_name:t.client_name,
            created_by:t.created_by,
            created_date:new Date(),
            delivered_date:new Date(t.delivered_date),
            team_manager:'',
            manager_email:'',
            team_leader:'',
            leader_email:'',
            service_engineer:'',
            engineer_email:'',
            checkpoint_exsit:t.checkpoint_exsit,
            deliverable_services:selectedService,
            deliverable_systems:selectedSystem,
            deliverable_items:selectedItem,
            deliverable_main_category:selectedMainCatg,
            deliverable_sub_category:selectedSubCatg,
            deliverable_parameter:selectedParameter,
            deliverable_codes:selectedCode, 
            deliverable_status:'save',
            review_info:[{
                '_id':new ObjectId(),
                review_name:t.review_name,
                created_by:t.created_by,
                created_date:new Date(),
                prepared_by:'',
                prepared_date:'',
                submission_status:'',
                reviewed_by:'',
                reviewed_status:'',
                reviewed_date:'',
                approved_by:'',
                approved_date:'',
                approved_status:'',
                selfqc_marks:0,
                peerqc_marks:0,
                diffqc_marks:0,
                finalqc_marks:0,
                self_qc_info:subDocument,
                peer_qc_info:[]
            }]
        });
        data.save(function(err, result) { 
            if (err) {
                return res.status(500).json({
                    title: 'An error occurred',
                    error: err
                });
            }
            else
            {
                QC.Project.aggregate([
                    { $match:{"_id":{ $eq: ObjectId(req.params.pid) }}},    
                    { $unwind: '$revision_info' },
                    {
                        $group:
                        {
                            _id: {'_id':'$project_name'},
                            lastrevision: { $last: "$revision_info" } 
                        }
                    },
                    { $unwind: '$lastrevision' },
                    { $unwind: '$lastrevision.deliverable_info' },
                    { $match:{"lastrevision.deliverable_info.deliverable_status":{ $ne: "draft" }}},
                    { $unwind: '$lastrevision.deliverable_info.review_info' },
                    {
                        $group:
                        {
                            _id: {'_id':'$lastrevision.deliverable_info._id','drawing_number':'$lastrevision.deliverable_info.drawing_number','drawing_title':'$lastrevision.deliverable_info.drawing_title','delivered_date':'$lastrevision.deliverable_info.delivered_date','team_leader':'$lastrevision.deliverable_info.team_leader','service_engineer':'$lastrevision.deliverable_info.service_engineer','deliverable_status':'$lastrevision.deliverable_info.deliverable_status','checkpoint_exsit':'$lastrevision.deliverable_info.checkpoint_exsit'},
                            lastreview: { $last: "$lastrevision.deliverable_info.review_info" } 
                        }
                    },
                    { $unwind: '$lastreview' },
                    {
                        $group:
                        {
                            _id: {'_id':'$_id._id','drawing_number':'$_id.drawing_number','drawing_title':'$_id.drawing_title','delivered_date':'$_id.delivered_date','team_leader':'$_id.team_leader','service_engineer':'$_id.service_engineer','deliverable_status':'$_id.deliverable_status','checkpoint_exsit':'$_id.checkpoint_exsit','review_id':'$lastreview._id','review_name':'$lastreview.review_name'},
                        }
                    },
                    {
                        $project:
                        {
                            _id:'$_id._id',
                            drawing_number:'$_id.drawing_number',
                            drawing_title:'$_id.drawing_title',
                            delivered_date:'$_id.delivered_date',
                            team_leader:'$_id.team_leader',
                            service_engineer:'$_id.service_engineer',
                            deliverable_status:'$_id.deliverable_status',
                            checkpoint_exsit:'$_id.checkpoint_exsit',
                            review_id:'$_id.review_id',
                            review_name:'$_id.review_name'
                        }
                    }
                ], function (err, result2) {
                    if (err) {
                        next(err);
                    } 
                    else 
                    {
                        res.status(201).json({
                            deliverableList:result2
                        }); 
                    }
                });
            }
        });
    });
});

router.get('/qc/removedeliverable/:pid/:rid/:did',jwtAuth, function (req, res, next) {
    QC.Project.findById(ObjectId(req.params.pid),function(err, data){  
        var t=data.revision_info.id(ObjectId(req.params.rid)).deliverable_info.id(ObjectId(req.params.did));
        t.remove();
        data.save(function(err, result) { 
            if (err) {
                return res.status(500).json({
                    title: 'An error occurred',
                    error: err
                });
            }
            else
            {
                QC.Project.aggregate([
                    { $match:{"_id":{ $eq: ObjectId(req.params.pid) }}},    
                    { $unwind: '$revision_info' },
                    {
                        $group:
                        {
                            _id: {'_id':'$project_name'},
                            lastrevision: { $last: "$revision_info" } 
                        }
                    },
                    { $unwind: '$lastrevision' },
                    { $unwind: '$lastrevision.deliverable_info' },
                    { $match:{"lastrevision.deliverable_info.deliverable_status":{ $ne: "draft" }}},
                    { $unwind: '$lastrevision.deliverable_info.review_info' },
                    {
                        $group:
                        {
                            _id: {'_id':'$lastrevision.deliverable_info._id','drawing_number':'$lastrevision.deliverable_info.drawing_number','drawing_title':'$lastrevision.deliverable_info.drawing_title','delivered_date':'$lastrevision.deliverable_info.delivered_date','team_leader':'$lastrevision.deliverable_info.team_leader','service_engineer':'$lastrevision.deliverable_info.service_engineer','deliverable_status':'$lastrevision.deliverable_info.deliverable_status','checkpoint_exsit':'$lastrevision.deliverable_info.checkpoint_exsit'},
                            lastreview: { $last: "$lastrevision.deliverable_info.review_info" } 
                        }
                    },
                    { $unwind: '$lastreview' },
                    {
                        $group:
                        {
                            _id: {'_id':'$_id._id','drawing_number':'$_id.drawing_number','drawing_title':'$_id.drawing_title','delivered_date':'$_id.delivered_date','team_leader':'$_id.team_leader','service_engineer':'$_id.service_engineer','deliverable_status':'$_id.deliverable_status','checkpoint_exsit':'$_id.checkpoint_exsit','review_id':'$lastreview._id','review_name':'$lastreview.review_name'},
                        }
                    },
                    {
                        $project:
                        {
                            _id:'$_id._id',
                            drawing_number:'$_id.drawing_number',
                            drawing_title:'$_id.drawing_title',
                            delivered_date:'$_id.delivered_date',
                            team_leader:'$_id.team_leader',
                            service_engineer:'$_id.service_engineer',
                            deliverable_status:'$_id.deliverable_status',
                            checkpoint_exsit:'$_id.checkpoint_exsit',
                            review_id:'$_id.review_id',
                            review_name:'$_id.review_name'
                        }
                    }
                ], function (err, result2) {
                    if (err) {
                        next(err);
                    } 
                    else 
                    {
                        res.status(201).json({
                            deliverableList:result2
                        }); 
                    }
                });
            }
        });
    });
});
router.get('/qc/changedeliverableservice/:services/:systems/:items/:mcatgs/:scatgs/:paras/:codes/:dcatgs/:dscatgs',jwtAuth, function (req, res, next) {

    var services=JSON.parse(req.params.services);
    var systems=JSON.parse(req.params.systems);
    var items=JSON.parse(req.params.items);
    var mcatgs=JSON.parse(req.params.mcatgs);
    var scatgs=JSON.parse(req.params.scatgs);
    var paras=JSON.parse(req.params.paras);
    var codes=JSON.parse(req.params.codes);
    var dcatgs=JSON.parse(req.params.dcatgs);
    var dscatgs=JSON.parse(req.params.dscatgs);

    var selectedServices=[];
    services.forEach(function(item){
        selectedServices.push(item.name);
    });
    var selectedSystems=[];
    var selectedItems=[];
    var selectedMCatgs=[];
    var selectedSCatgs=[];
    var selectedDCatgs=[];

    var subDocument1=[];
    var subDocument2=[];
    var subDocument3=[];
    var subDocument4=[];
    var subDocument5=[];
    var subDocument6=[];
    var subDocument7=[];
    var subDocument8=[];

    if(services.length>0)
    {
        Thogupu.Service.aggregate([
            { $match:{"service_name":{ $in: selectedServices }}},  
            { $unwind: '$deliverable_info' },
            {
                $group: {
                    _id:{'_id':'$deliverable_info.deliverable_name'}
                }
            },
            {
                $project:
                {
                    _id:0,
                    id:'$_id._id',
                    name:'$_id._id'
                }
            },  
            {
                $sort:
                {
                    'id' :1
                }
            }
        ], function (err, result6) {
            if (err) {
                next(err);
            } 
            else 
            {
                result6.forEach(function(ci){
                    var index = dcatgs.findIndex(x => x.name==ci.name);
                    if(index>=0)
                    {
                        subDocument7.push({
                            id:ci.name,
                            name:ci.name,
                        });
                        selectedDCatgs.push(ci.name);
                    }
                });

                Thogupu.Service.aggregate([
                    { $match:{"service_name":{ $in: selectedServices }}},  
                    { $unwind: '$deliverable_info' },
                    { $match:{"deliverable_info.deliverable_name":{ $in: selectedDCatgs }}}, 
                    { $unwind: '$deliverable_info.sub_deliverable_info' }, 
                    {
                        $group: {
                            _id:{'_id':'$deliverable_info.sub_deliverable_info.sub_deliverable_name'}
                        }
                    },
                    {
                        $project:
                        {
                            _id:0,
                            id:'$_id._id',
                            name:'$_id._id'
                        }
                    },  
                    {
                        $sort:
                        {
                            'id' :-1
                        }
                    }
                ], function (err, result7) {
                    if (err) {
                        next(err);
                    } 
                    else 
                    {
                        result7.forEach(function(ci){
                            var index = dscatgs.findIndex(x => x.name==ci.name);
                            if(index>=0)
                            {
                                subDocument8.push({
                                    id:ci.name,
                                    name:ci.name,
                                });
                            }
                        });

                        Thogupu.Service.aggregate([
                            { $match:{"service_name":{ $in: selectedServices }}},  
                            { $unwind: '$code_info' },
                            {
                                $group: {
                                    _id:{'_id':'$code_info._id','code_name':'$code_info.code_name'}
                                }
                            },
                            {
                                $project:
                                {
                                    _id:0,
                                    id:'$_id._id',
                                    name:'$_id.code_name'
                                }
                            },  
                            {
                                $sort:
                                {
                                    'id' :-1
                                }
                            }
                        ], function (err, result5) {
                            if (err) {
                                next(err);
                            } 
                            else 
                            {
                                result5.forEach(function(ci){
                                    var index = codes.findIndex(x => x.name==ci.name);
                                    if(index>=0)
                                    {
                                        subDocument6.push({
                                            id:ci.name,
                                            name:ci.name,
                                        });
                                    }
                                }); 

                                Thogupu.Service.aggregate([
                                    { $match:{"service_name":{ $in: selectedServices }}},  
                                    { $unwind: '$system_info' },
                                    {
                                        $group: {
                                            _id:{'_id':'$system_info.system_name'}
                                        }
                                    },
                                    {
                                        $project:
                                        {
                                            _id:0,
                                            id:'$_id._id',
                                            name:'$_id._id'
                                        }
                                    },  
                                    {
                                        $sort:
                                        {
                                            'id' :-1
                                        }
                                    }
                                ], function (err, result) {
                                    if (err) {
                                        next(err);
                                    } 
                                    else 
                                    {
                                        result.forEach(function(ci){
                                            var index = systems.findIndex(x => x.name==ci.name);
                                            if(index>=0)
                                            {
                                                subDocument1.push({
                                                    id:ci.name,
                                                    name:ci.name,
                                                });
                                                selectedSystems.push(ci.name);
                                            }
                                        }); 
                                        if(subDocument1.length>0)
                                        {
                                            Thogupu.Service.aggregate([
                                                { $match:{"service_name":{ $in: selectedServices }}},  
                                                { $unwind: '$system_info' },
                                                { $match:{"system_info.system_name":{ $in: selectedSystems }}},  
                                                { $unwind: '$system_info.item_info' },
                                                {
                                                    $group: {
                                                        _id:{'_id':'$system_info.item_info.item_name'}
                                                    }
                                                },
                                                {
                                                    $project:
                                                    {
                                                        _id:0,
                                                        id:'$_id._id',
                                                        name:'$_id._id'
                                                    }
                                                },  
                                                {
                                                    $sort:
                                                    {
                                                        'id' :-1
                                                    }
                                                }
                                            ], function (err, result1) {
                                                if (err) {
                                                    next(err);
                                                } 
                                                else 
                                                {
                                                    result1.forEach(function(ci){
                                                        var index = items.findIndex(x => x.name==ci.name);
                                                        if(index>=0)
                                                        {
                                                            subDocument2.push({
                                                                id:ci.name,
                                                                name:ci.name,
                                                            });
                                                            selectedItems.push(ci.name);
                                                        }
                                                    }); 
                                                    if(subDocument2.length>0)
                                                    {
                                                        Thogupu.Service.aggregate([
                                                            { $match:{"service_name":{ $in: selectedServices }}},  
                                                            { $unwind: '$system_info' },
                                                            { $match:{"system_info.system_name":{ $in: selectedSystems }}},  
                                                            { $unwind: '$system_info.item_info' },
                                                            { $match:{"system_info.item_info.item_name":{ $in: selectedItems }}},  
                                                            { $unwind: '$system_info.item_info.main_category_info' },
                                                            {
                                                                $group: {
                                                                    _id:{'_id':'$system_info.item_info.main_category_info.main_category_name'}
                                                                }
                                                            },
                                                            {
                                                                $project:
                                                                {
                                                                    _id:0,
                                                                    id:'$_id._id',
                                                                    name:'$_id._id'
                                                                }
                                                            },  
                                                            {
                                                                $sort:
                                                                {
                                                                    'id' :-1
                                                                }
                                                            }
                                                        ], function (err, result2) {
                                                            if (err) {
                                                                next(err);
                                                            } 
                                                            else 
                                                            {
                                                                result2.forEach(function(ci){
                                                                    var index = mcatgs.findIndex(x => x.name==ci.name);
                                                                    if(index>=0)
                                                                    {
                                                                        subDocument3.push({
                                                                            id:ci.name,
                                                                            name:ci.name,
                                                                        });
                                                                        selectedMCatgs.push(ci.name);
                                                                    }
                                                                }); 
                                                                if(subDocument3.length>0)
                                                                {
                                                                    Thogupu.Service.aggregate([
                                                                        { $match:{"service_name":{ $in: selectedServices }}},  
                                                                        { $unwind: '$system_info' },
                                                                        { $match:{"system_info.system_name":{ $in: selectedSystems }}},  
                                                                        { $unwind: '$system_info.item_info' },
                                                                        { $match:{"system_info.item_info.item_name":{ $in: selectedItems }}},  
                                                                        { $unwind: '$system_info.item_info.main_category_info' },
                                                                        { $match:{"system_info.item_info.main_category_info.main_category_name":{ $in: selectedMCatgs }}},  
                                                                        { $unwind: '$system_info.item_info.main_category_info.sub_category_info' },
                                                                        {
                                                                            $group: {
                                                                                _id:{'_id':'$system_info.item_info.main_category_info.sub_category_info.sub_category_name'}
                                                                            }
                                                                        },
                                                                        {
                                                                            $project:
                                                                            {
                                                                                _id:0,
                                                                                id:'$_id._id',
                                                                                name:'$_id._id'
                                                                            }
                                                                        },  
                                                                        {
                                                                            $sort:
                                                                            {
                                                                                'id' :-1
                                                                            }
                                                                        }
                                                                    ], function (err, result3) {
                                                                        if (err) {
                                                                            next(err);
                                                                        } 
                                                                        else 
                                                                        {
                                                                            result3.forEach(function(ci){
                                                                                var index = scatgs.findIndex(x => x.name==ci.name);
                                                                                if(index>=0)
                                                                                {
                                                                                    subDocument4.push({
                                                                                        id:ci.name,
                                                                                        name:ci.name,
                                                                                    });
                                                                                    selectedSCatgs.push(ci.name);
                                                                                }
                                                                            }); 
                                                                            if(subDocument4.length>0)
                                                                            {
                                                                                Thogupu.Service.aggregate([
                                                                                    { $match:{"service_name":{ $in: selectedServices }}},  
                                                                                    { $unwind: '$system_info' },
                                                                                    { $match:{"system_info.system_name":{ $in: selectedSystems }}},  
                                                                                    { $unwind: '$system_info.item_info' },
                                                                                    { $match:{"system_info.item_info.item_name":{ $in: selectedItems }}},  
                                                                                    { $unwind: '$system_info.item_info.main_category_info' },
                                                                                    { $match:{"system_info.item_info.main_category_info.main_category_name":{ $in: selectedMCatgs }}},  
                                                                                    { $unwind: '$system_info.item_info.main_category_info.sub_category_info' },
                                                                                    { $match:{"system_info.item_info.main_category_info.sub_category_info.sub_category_name":{ $in: selectedSCatgs }}},  
                                                                                    { $unwind: '$system_info.item_info.main_category_info.sub_category_info.parameter_info' },
                                                                                    {
                                                                                        $group: {
                                                                                            _id:{'_id':'$system_info.item_info.main_category_info.sub_category_info.parameter_info.parameter_name'}
                                                                                        }
                                                                                    },
                                                                                    {
                                                                                        $project:
                                                                                        {
                                                                                            _id:0,
                                                                                            id:'$_id._id',
                                                                                            name:'$_id._id'
                                                                                        }
                                                                                    },  
                                                                                    {
                                                                                        $sort:
                                                                                        {
                                                                                            'id' :-1
                                                                                        }
                                                                                    }
                                                                                ], function (err, result4) {
                                                                                    if (err) {
                                                                                        next(err);
                                                                                    } 
                                                                                    else 
                                                                                    {
                                                                                        result4.forEach(function(ci){
                                                                                            var index = paras.findIndex(x => x.name==ci.name);
                                                                                            if(index>=0)
                                                                                            {
                                                                                                subDocument5.push({
                                                                                                    id:ci.name,
                                                                                                    name:ci.name,
                                                                                                });
                                                                                            }
                                                                                        }); 
                                                                                        res.status(201).json({
                                                                                            selectedDelCategory:subDocument7,
                                                                                            selectedDelSubCategory:subDocument8,
                                                                                            selectedSystem:subDocument1,
                                                                                            selectedItem:subDocument2,
                                                                                            selectedMainCatg:subDocument3,
                                                                                            selectedSubCatg:subDocument4,
                                                                                            selectedParameter:subDocument5,
                                                                                            selectedCode:subDocument6,
                                                                                            delCategoryList:result6,
                                                                                            delSubCategoryList:result7,
                                                                                            systemList:result,
                                                                                            itemList:result1,
                                                                                            mainCatgList:result2,
                                                                                            subCatgList:result3,
                                                                                            parameterList:result4,
                                                                                            codeList:result5
                                                                                        });
                                                                                    }
                                                                                });
                                                                            }
                                                                            else
                                                                            {
                                                                                res.status(201).json({
                                                                                    selectedDelCategory:subDocument7,
                                                                                    selectedDelSubCategory:subDocument8,
                                                                                    selectedSystem:subDocument1,
                                                                                    selectedItem:subDocument2,
                                                                                    selectedMainCatg:subDocument3,
                                                                                    selectedSubCatg:[],
                                                                                    selectedParameter:[],
                                                                                    selectedCode:subDocument6,
                                                                                    delCategoryList:result6,
                                                                                    delSubCategoryList:result7,
                                                                                    systemList:result,
                                                                                    itemList:result1,
                                                                                    mainCatgList:result2,
                                                                                    subCatgList:result3,
                                                                                    parameterList:[],
                                                                                    codeList:result5
                                                                                });
                                                                            }
                                                                        }
                                                                    });
                                                                }
                                                                else
                                                                {
                                                                    res.status(201).json({
                                                                        selectedDelCategory:subDocument7,
                                                                        selectedDelSubCategory:subDocument8,
                                                                        selectedSystem:subDocument1,
                                                                        selectedItem:subDocument2,
                                                                        selectedMainCatg:[],
                                                                        selectedSubCatg:[],
                                                                        selectedParameter:[],
                                                                        selectedCode:subDocument6,
                                                                        delCategoryList:result6,
                                                                        delSubCategoryList:result7,
                                                                        systemList:result,
                                                                        itemList:result1,
                                                                        mainCatgList:result2,
                                                                        subCatgList:[],
                                                                        parameterList:[],
                                                                        codeList:result5
                                                                    });
                                                                }
                                                            }
                                                        });
                                                    }
                                                    else
                                                    {
                                                        res.status(201).json({
                                                            selectedDelCategory:subDocument7,
                                                            selectedDelSubCategory:subDocument8,
                                                            selectedSystem:subDocument1,
                                                            selectedItem:[],
                                                            selectedMainCatg:[],
                                                            selectedSubCatg:[],
                                                            selectedParameter:[],
                                                            selectedCode:subDocument6,
                                                            delCategoryList:result6,
                                                            delSubCategoryList:result7,
                                                            systemList:result,
                                                            itemList:result1,
                                                            mainCatgList:[],
                                                            subCatgList:[],
                                                            parameterList:[],
                                                            codeList:result5
                                                        });
                                                    }
                                                }
                                            });
                                        }
                                        else
                                        {
                                            res.status(201).json({
                                                selectedDelCategory:subDocument7,
                                                selectedDelSubCategory:subDocument8,
                                                selectedSystem:[],
                                                selectedItem:[],
                                                selectedMainCatg:[],
                                                selectedSubCatg:[],
                                                selectedParameter:[],
                                                selectedCode:subDocument6,
                                                delCategoryList:result6,
                                                delSubCategoryList:result7,
                                                systemList:result,
                                                itemList:[],
                                                mainCatgList:[],
                                                subCatgList:[],
                                                parameterList:[],
                                                codeList:result5
                                            });
                                        }
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    }
    else
    {
        res.status(201).json({
            selectedDelCategory:[],
            selectedDelSubCategory:[],
            selectedSystem:[],
            selectedItem:[],
            selectedMainCatg:[],
            selectedSubCatg:[],
            selectedParameter:[],
            selectedCode:[],
            delCategoryList:[],
            delSubCategoryList:[],
            systemList:[],
            itemList:[],
            mainCatgList:[],
            subCatgList:[],
            parameterList:[],
            codeList:[]
        });
    }
});

router.get('/qc/changedeliverablecategory/:services/:dcatgs/:dscatgs',jwtAuth, function (req, res, next) {
    var services=JSON.parse(req.params.services);
    var dcatgs=JSON.parse(req.params.dcatgs);
    var dscatgs=JSON.parse(req.params.dscatgs);

    var selectedServices=[];
    services.forEach(function(item){
        selectedServices.push(item.name);
    });

    var selectedDCatgs=[];
    dcatgs.forEach(function(item){
        selectedDCatgs.push(item.name);
    });
    var subDocument=[];
    Thogupu.Service.aggregate([
        { $match:{"service_name":{ $in: selectedServices }}},  
        { $unwind: '$deliverable_info' },
        { $match:{"deliverable_info.deliverable_name":{ $in: selectedDCatgs }}}, 
        { $unwind: '$deliverable_info.sub_deliverable_info' }, 
        {
            $group: {
                _id:{'_id':'$deliverable_info.sub_deliverable_info.sub_deliverable_name'}
            }
        },
        {
            $project:
            {
                _id:0,
                id:'$_id._id',
                name:'$_id._id'
            }
        },  
        {
            $sort:
            {
                'id' :1
            }
        }
    ], function (err, result) {
        if (err) {
            next(err);
        } 
        else 
        {
            result.forEach(function(ci){
                var index = dscatgs.findIndex(x => x.name==ci.name);
                if(index>=0)
                {
                    subDocument.push({
                        id:ci.name,
                        name:ci.name,
                    });
                }
            });
            res.status(201).json({
                selectedDelSubCategory:subDocument,
                delSubCategoryList:result
            });
        }
    });
});

router.get('/qc/getprojectservices/:pid/:rid',jwtAuth, function (req, res, next) {
    QC.Project.aggregate([
        { $match:{"_id": ObjectId(req.params.pid) }},  
        { $unwind: '$revision_info' },
        { $match:{"revision_info._id": ObjectId(req.params.rid) }},  
        { $unwind: '$revision_info.project_services' },
        {
            $group: {
                _id:{'_id':'$revision_info.project_services._id','service_name':'$revision_info.project_services.service_name'}
            }
        },
        {
            $project:
            {
                _id:'$_id._id',
                id:'$_id.service_name',
                name:'$_id.service_name'
            }
        },  
        {
            $sort:
            {
                '_id' :-1
            }
        }
    ], function (err, result) {
        if (err) {
            next(err);
        } 
        else 
        {
            res.json(result);
        }
    });
});

router.post('/qc/savedeliverable',jwtAuth,function (req, res, next) {
    var bulkquery=req.body;

    QC.Project.findById(ObjectId(bulkquery.pid),function(err, data){  
        var t=data.revision_info.id(ObjectId(bulkquery.rid)).deliverable_info;
        var aggregateArray=[];

        aggregateArray.push({ $unwind: '$country_info' });
        var subDocument9=[data.project_country];
        aggregateArray.push({$match:{'country_info.type_name':{ $in: subDocument9 }}});

        aggregateArray.push({ $unwind: '$state_info' });
        var subDocument10=[data.project_state];
        aggregateArray.push({$match:{'state_info.type_name':{ $in: subDocument10 }}});
        
        aggregateArray.push({ $unwind: '$ptype_info' });
        var subDocument11=[data.project_type];
        aggregateArray.push({$match:{'ptype_info.type_name':{ $in: subDocument11 }}});

        aggregateArray.push({ $unwind: '$psubtype_info' });
        var subDocument12=[];
        data.project_subtype_info.forEach(function(item){
            subDocument12.push(item.project_subtype);
        });
        aggregateArray.push({$match:{'psubtype_info.type_name':{ $in: subDocument12 }}});

        var subDocument13=[];
        var client_name='';
        if(bulkquery.selectedClients.length>0)
        {
            aggregateArray.push({ $unwind: '$client_info' });
            bulkquery.selectedClients.forEach(function(item){
                subDocument13.push(item.name);
                client_name=item.name;
            });
            aggregateArray.push({$match:{'client_info.type_name':{ $in: subDocument13 }}});
        }

        aggregateArray.push({ $unwind: '$service_info' });
        var selectedService=[];
        if(bulkquery.selectedDelServices.length>0)
        {
            var subDocument1=[];
            bulkquery.selectedDelServices.forEach(function(item){
                selectedService.push({
                    '_id':new ObjectId(),
                    service_name:item.name
                });
                subDocument1.push(item.name);
            });
            aggregateArray.push({$match:{'service_info.type_name':{ $in: subDocument1 }}});
        }

        aggregateArray.push({ $unwind: '$deliverable_info' });
        var subDocument14=[];
        var selectedDelCategory='';
        bulkquery.selectedDelCategory.forEach(function(item){
            subDocument14.push(item.name);
            selectedDelCategory=item.name;
        });
        aggregateArray.push({$match:{'deliverable_info.type_name':{ $in: subDocument14 }}});

        aggregateArray.push({ $unwind: '$subdeliverable_info' });
        var selectedDelSubCategory=[];
        if(bulkquery.selectedDelSubCategory.length>0)
        {
            var subDocument8=[];
            bulkquery.selectedDelSubCategory.forEach(function(item){
                selectedDelSubCategory.push({
                    '_id':new ObjectId(),
                    deliverable_sub_category:item.name
                });
                subDocument8.push(item.name);
            });
            aggregateArray.push({$match:{'subdeliverable_info.type_name':{ $in: subDocument8 }}});
        }
        
        var selectedSystem=[];
        if(bulkquery.selectedDelSystems.length>0)
        {
            aggregateArray.push({ $unwind: '$system_info' });
            var subDocument2=[];
            bulkquery.selectedDelSystems.forEach(function(item){
                selectedSystem.push({
                    '_id':new ObjectId(),
                    system_name:item.name
                });
                subDocument2.push(item.name);
                subDocument2.push('COMMON');
            });
            aggregateArray.push({$match:{'system_info.type_name':{ $in: subDocument2 }}});
        }

        var selectedItem=[];
        if(bulkquery.selectedDelItems.length>0)
        {
            aggregateArray.push({ $unwind: '$item_info' });
            var subDocument3=[];
            bulkquery.selectedDelItems.forEach(function(item){
                selectedItem.push({
                    '_id':new ObjectId(),
                    item_name:item.name
                });
                subDocument3.push(item.name);
                subDocument3.push('COMMON');
            });
            aggregateArray.push({$match:{'item_info.type_name':{ $in: subDocument3 }}});
        }

        var selectedMainCatg=[];
        if(bulkquery.selectedDelMainCatg.length>0)
        {
            aggregateArray.push({ $unwind: '$main_category_info' });
            var subDocument4=[];
            bulkquery.selectedDelMainCatg.forEach(function(item){
                selectedMainCatg.push({
                    '_id':new ObjectId(),
                    main_category_name:item.name
                });
                subDocument4.push(item.name);
                subDocument4.push('COMMON');
            });
            aggregateArray.push({$match:{'main_category_info.type_name':{ $in: subDocument4 }}});
        }

        var selectedSubCatg=[];
        if(bulkquery.selectedDelSubCatg.length>0)
        {
            aggregateArray.push({ $unwind: '$sub_category_info' });
            var subDocument5=[];
            bulkquery.selectedDelSubCatg.forEach(function(item){
                selectedSubCatg.push({
                    '_id':new ObjectId(),
                    sub_category_name:item.name
                });
                subDocument5.push(item.name);
                subDocument5.push('COMMON');
            });
            aggregateArray.push({$match:{'sub_category_info.type_name':{ $in: subDocument5 }}});
        }

        var selectedParameter=[];
        if(bulkquery.selectedDelParameter.length>0)
        {
            aggregateArray.push({ $unwind: '$parameter_info' });
            var subDocument6=[];
            bulkquery.selectedDelParameter.forEach(function(item){
                selectedParameter.push({
                    '_id':new ObjectId(),
                    parameter_name:item.name
                });
                subDocument6.push(item.name);
                subDocument6.push('COMMON');
            });
            aggregateArray.push({$match:{'parameter_info.type_name':{ $in: subDocument6 }}});
        }

        var selectedCode=[];
        if(bulkquery.selectedDelCodes.length>0)
        {
            aggregateArray.push({ $unwind: '$code_info' });
            var subDocument7=[];
            bulkquery.selectedDelCodes.forEach(function(item){
                selectedCode.push({
                    '_id':new ObjectId(),
                    code_name:item.name
                });
                subDocument7.push(item.name);
            });
            aggregateArray.push({$match:{'code_info.type_name':{ $in: subDocument7 }}});
        }

        aggregateArray.push({
            $group:
            {
                _id: {'_id':'$_id','checkpoint_name':'$checkpoint_name','created_by':'$created_by','error_class':'$error_class','error_impact':'$error_impact'}
            }
        },
        {
            $project:
            {
                _id:'$_id._id',
                checkpoint_name:'$_id.checkpoint_name',
                created_by:'$_id.created_by',
                error_class:'$_id.error_class',
                error_impact:'$_id.error_impact'
            }
        },
        { 
            $sort : { _id : 1}
        });
        QC.Temp.aggregate(aggregateArray, function (err, result) { 
            if (err) {
                next(err);
            } 
            else 
            {
                
                if(result.length>0)
                {
                    var did='';
                    var reviewid='';
                    if(bulkquery.did==undefined && bulkquery.reviewid==undefined)
                    {
                        did=new ObjectId();
                        reviewid=new ObjectId();
                        t.push({
                            '_id':did,
                            drawing_number:bulkquery.drawing_number,
                            drawing_title:bulkquery.drawing_title,
                            deliverable_reference:bulkquery.deliverable_reference,
                            deliverable_description:bulkquery.deliverable_description,
                            deliverable_category:selectedDelCategory,
                            deliverable_subcategory:selectedDelSubCategory,
                            is_client_specific:bulkquery.is_client_specific,
                            client_name:client_name,
                            created_by:bulkquery.user_name,
                            created_date:new Date(),
                            delivered_date:new Date(bulkquery.delivered_date),
                            team_manager:'',
                            manager_email:'',
                            team_leader:'',
                            leader_email:'',
                            service_engineer:'',
                            engineer_email:'',
                            checkpoint_exsit:false,
                            deliverable_services:selectedService,
                            deliverable_systems:selectedSystem,
                            deliverable_items:selectedItem,
                            deliverable_main_category:selectedMainCatg,
                            deliverable_sub_category:selectedSubCatg,
                            deliverable_parameter:selectedParameter,
                            deliverable_codes:selectedCode, 
                            deliverable_status:'save',
                            review_info:[{
                                '_id':reviewid,
                                review_name:'IR0',
                                created_by:bulkquery.user_name,
                                created_date:new Date(),
                                prepared_by:'',
                                prepared_date:'',
                                submission_status:'',
                                reviewed_by:'',
                                reviewed_status:'',
                                reviewed_date:'',
                                approved_by:'',
                                approved_date:'',
                                approved_status:'',
                                selfqc_marks:0,
                                peerqc_marks:0,
                                diffqc_marks:0,
                                finalqc_marks:0,
                                self_qc_info:[],
                                peer_qc_info:[]
                            }]
                        });
                    }
                    else
                    {
                        did=bulkquery.did;
                        reviewid=bulkquery.reviewid;
                        var d=t.id(ObjectId(bulkquery.did));
                        d.drawing_number=bulkquery.drawing_number;
                        d.drawing_title=bulkquery.drawing_title;
                        d.deliverable_reference=bulkquery.deliverable_reference;
                        d.deliverable_description=bulkquery.deliverable_description;
                        d.deliverable_category=selectedDelCategory;
                        d.deliverable_subcategory=selectedDelSubCategory;
                        d.is_client_specific=bulkquery.is_client_specific;
                        d.client_name=client_name;
                        d.created_by=bulkquery.user_name;
                        d.created_date=new Date();
                        d.delivered_date=new Date(bulkquery.delivered_date);
                        d.checkpoint_exsit=false;
                        d.deliverable_services=selectedService;
                        d.deliverable_systems=selectedSystem;
                        d.deliverable_items=selectedItem;
                        d.deliverable_main_category=selectedMainCatg;
                        d.deliverable_sub_category=selectedSubCatg;
                        d.deliverable_parameter=selectedParameter;
                        d.deliverable_codes=selectedCode;
                        d.deliverable_status='save';
                    }
                    data.save(function(err, result1) { 
                        if (err) {
                            return res.status(500).json({
                                title: 'An error occurred',
                                error: err
                            });
                        }
                        res.status(201).json({
                            did:did,
                            reviewid:reviewid,
                            checkpointsList:result,
                            msg:'saved'
                        });
                    });
                    
                }
                else
                {
                    res.status(201).json({
                        msg:'no checkpoints'
                    });
                }
                
            }
        });
    });
});

router.post('/qc/confirmcheckPoint/:pid/:rid/:did/:reviewid',jwtAuth,function (req, res, next) {
    var bulkquery=req.body;
    QC.Temp.aggregate([
        {
            $group:
            {
                _id: {'_id':'$_id','checkpoint_name':'$checkpoint_name','created_by':'$created_by','error_class':'$error_class','error_impact':'$error_impact','service_info':'$service_info','system_info':'$system_info','item_info':'$item_info','main_category_info':'$main_category_info','sub_category_info':'$sub_category_info','parameter_info':'$parameter_info','code_info':'$code_info','notes_info':'$notes_info'}
                
            }
        },
        {
            $project:
            {
                _id:'$_id._id',
                checkpoint_name:'$_id.checkpoint_name',
                created_by:'$_id.created_by',
                error_class:'$_id.error_class',
                error_impact:'$_id.error_impact',
                service_info:'$_id.service_info',
                system_info:'$_id.system_info',
                item_info:'$_id.item_info',
                main_category_info:'$_id.main_category_info',
                sub_category_info:'$_id.sub_category_info',
                parameter_info:'$_id.parameter_info',
                code_info:'$_id.code_info',
                notes_info:'$_id.notes_info'
            }
        },
        { 
            $sort : { _id : 1}
        }
    ], function (err, result) {
        if (err) {
            next(err);
        } 
        else 
        {
            QC.Project.findById(ObjectId(req.params.pid),function(err, data){  
                var t=data.revision_info.id(ObjectId(req.params.rid)).deliverable_info.id(ObjectId(req.params.did)).review_info.id(ObjectId(req.params.reviewid));
                var t2=data.revision_info.id(ObjectId(req.params.rid)).deliverable_info.id(ObjectId(req.params.did));

                var subDocument=[];
                bulkquery.forEach(function(item){
                    var impacts=[];
                    var services=[];
                    var systems=[];
                    var items=[];
                    var mcatgs=[];
                    var scatgs=[];
                    var parameters=[];
                    var codes=[];
                    var noteInfo=[];

                    var index = result.findIndex(x => x._id==item._id);
                    if(index>=0)
                    {
                        result[index].error_impact.forEach(function(im){
                            impacts.push({
                                '_id':new ObjectId(),
                                type_name:im.type_name
                            });
                        });

                        result[index].service_info.forEach(function(s){
                            services.push({
                                '_id':new ObjectId(),
                                service_name:s.type_name
                            });
                        });
            
                        result[index].system_info.forEach(function(si){
                            systems.push({
                                '_id':new ObjectId(),
                                system_name:si.type_name
                            });
                        });
            
                        result[index].item_info.forEach(function(ii){
                            items.push({
                                '_id':new ObjectId(),
                                item_name:ii.type_name
                            });
                        });
            
                        result[index].main_category_info.forEach(function(mi){
                            mcatgs.push({
                                '_id':new ObjectId(),
                                main_category_name:mi.type_name
                            });
                        });
            
                        result[index].sub_category_info.forEach(function(sc){
                            scatgs.push({
                                '_id':new ObjectId(),
                                sub_category_name:sc.type_name
                            });
                        });
            
                        result[index].parameter_info.forEach(function(pi){
                            parameters.push({
                                '_id':new ObjectId(),
                                parameter_name:pi.type_name
                            });
                        });
            
                        result[index].code_info.forEach(function(ci){
                            codes.push({
                                '_id':new ObjectId(),
                                code_name:ci.type_name
                            });
                        });
            
                        result[index].notes_info.forEach(function(item2){
                            var fileInfo=[];
                            item2.file_info.forEach(function(item1){
                                fileInfo.push({
                                    '_id':new ObjectId(),
                                    file_url:item1.file_url,
                                    file_type:item1.file_type,
                                }); 
                            });
                            noteInfo.push({
                                '_id':new ObjectId(),
                                notes_desc:item2.notes_desc,
                                created_by:item2.created_by,
                                created_date:item2.created_date,
                                file_info:fileInfo
                            });
                        });
                    }
        
                    subDocument.push({
                        '_id':new ObjectId(),
                        check_point_name:item.checkpoint_name,
                        error_class:item.error_class,
                        error_impact:impacts,
                        check_point_from:'Template',
                        created_by:item.created_by,
                        mismatch_answer:'',
                        qe_answer:'',
                        se_answer:'',
                        service_info:services,
                        system_info:systems,
                        item_info:items,
                        main_category_info:mcatgs,
                        sub_category_info:scatgs,
                        parameter_info:parameters,
                        code_info:codes,
                        notes_info:noteInfo,
                        cp_remarks:'',
                        cp_comments:''
                    });
                });
                t.self_qc_info=subDocument;
                t2.checkpoint_exsit=true;
                data.save(function(err, result1) { 
                    if (err) {
                        return res.status(500).json({
                            title: 'An error occurred',
                            error: err
                        });
                    }
                    res.status(201).json({
                        msg:'saved',
                        checkpoint_exsit:t2.checkpoint_exsit,
                        deliverable_status:t2.deliverable_status
                    });
                });
            });
        }
    });
});

router.post("/uploaddrawingdtl", function(req, res) {
    var multer = require('multer');
    var fs= require('fs');
    var img_url="";
    var img_name="";
    var imgicon = multer.diskStorage({
        destination: function(req, file, callback) {
            if (!fs.existsSync('public/drawings'))
            {
                fs.mkdirSync('public/drawings');   
            }
            else
            {
                var testFolder = 'public/drawings';
                fs.readdirSync(testFolder).forEach(file => {
                    fs.unlinkSync(testFolder+'/'+file);
                })
            }
            callback(null,'public/drawings');
        },
        filename: function(req, file, callback) {
            callback(null, file.originalname);
            img_url='drawings/'+file.originalname;
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
            var drawingInfo=[];
            const ExcelJS = require('exceljs');
            const workbook = new ExcelJS.Workbook();
            workbook.xlsx.readFile('public/'+img_url).then(function() {
                workbook.eachSheet((sheet, id) => {
                    sheet.eachRow((row, rowIndex) => {
                        if(rowIndex>1)
                        {
                            drawingInfo.push({
                                drawing_number:row.values[1],
                                drawing_title:row.values[2],
                                deliver_date:row.values[3]
                            });
                        }
                    });
                    res.send({ fileUrl: img_url,fileName:img_name,drawingInfo:drawingInfo });
                })
            });
        }
    });
});

router.post('/qc/saveproject',jwtAuth,function (req, res, next) {

    var bulkquery=req.body;
    QC.Project.findById(ObjectId(bulkquery.pid),function(err, data){  

        
        var selectedManager=[];
        bulkquery.selectedManager.forEach(function(item){
            selectedManager.push({
                '_id':new ObjectId(),
                user_name:item.name,
                email_id:item.email_id,
                profile_img:item.profile_img
            });
        });
        var selectedLeader=[];
        bulkquery.selectedLeader.forEach(function(item){
            selectedLeader.push({
                '_id':new ObjectId(),
                user_name:item.name,
                email_id:item.email_id,
                profile_img:item.profile_img
            });
        });
        var selectedEngineer=[];
        bulkquery.selectedEngineer.forEach(function(item){
            selectedEngineer.push({
                '_id':new ObjectId(),
                user_name:item.name,
                email_id:item.email_id,
                profile_img:item.profile_img
            });
        });

        var selectedPSubType=[];
        bulkquery.selectedPSubType.forEach(function(item){
            selectedPSubType.push({
                '_id':new ObjectId(),
                project_subtype:item.name
            });
        });

        var selectedService=[];
        bulkquery.selectedService.forEach(function(item){
            selectedService.push({
                '_id':new ObjectId(),
                service_name:item.name
            });
        });
        
        var selectedSystem=[];
        bulkquery.selectedSystem.forEach(function(item){
            selectedSystem.push({
                '_id':new ObjectId(),
                system_name:item.name
            });
        });

        var selectedItem=[];
        bulkquery.selectedItem.forEach(function(item){
            selectedItem.push({
                '_id':new ObjectId(),
                item_name:item.name
            });
        });

        var selectedMainCatg=[];
        bulkquery.selectedMainCatg.forEach(function(item){
            selectedMainCatg.push({
                '_id':new ObjectId(),
                main_category_name:item.name
            });
        });

        var selectedSubCatg=[];
        bulkquery.selectedSubCatg.forEach(function(item){
            selectedSubCatg.push({
                '_id':new ObjectId(),
                sub_category_name:item.name
            });
        });

        var selectedParameter=[];
        bulkquery.selectedParameter.forEach(function(item){
            selectedParameter.push({
                '_id':new ObjectId(),
                parameter_name:item.name
            });
        });

        var selectedCode=[];
        bulkquery.selectedCode.forEach(function(item){
            selectedCode.push({
                '_id':new ObjectId(),
                code_name:item.name
            });
        });

        var drawingInfo=[];
        bulkquery.drawingInfo.forEach(function(item){
            drawingInfo.push({
                '_id':new ObjectId(),
                drawing_number:item.drawing_number,
                drawing_title:item.drawing_title,
                deliverable_reference:'',
                deliverable_description:'',
                deliverable_category:'',
                is_client_specific:false,
                client_name:'',
                created_by:bulkquery.user_name,
                created_date:new Date(),
                delivered_date:new Date(item.deliver_date),
                team_manager:'',
                manager_email:'',
                team_leader:'',
                leader_email:'',
                service_engineer:'',
                engineer_email:'',
                checkpoint_exsit:false,
                deliverable_services:[],
                deliverable_systems:[],
                deliverable_items:[],
                deliverable_main_category:[],
                deliverable_sub_category:[],
                deliverable_codes:[], 
                deliverable_subcategory:[],
                deliverable_status:'save',
                review_info:[{
                    '_id':new ObjectId(),
                    review_name:'IR0',
                    created_by:bulkquery.user_name,
                    created_date:new Date(),
                    prepared_by:'',
                    prepared_date:'',
                    submission_status:'',
                    reviewed_by:'',
                    reviewed_status:'',
                    reviewed_date:'',
                    approved_by:'',
                    approved_date:'',
                    approved_status:'',
                    selfqc_marks:0,
                    peerqc_marks:0,
                    diffqc_marks:0,
                    finalqc_marks:0,
                    self_qc_info:[],
                    peer_qc_info:[]
                }]
            });
        });

        var r=data.revision_info.id(ObjectId(bulkquery.rid));
        r.project_systems=selectedSystem;
        r.project_items=selectedItem;
        r.project_main_category=selectedMainCatg;
        r.project_sub_category=selectedSubCatg;
        r.project_parameter=selectedParameter;
        r.project_codes=selectedCode;
        r.deliverable_info=drawingInfo;
        
        data.manager_info=selectedManager;
        data.leader_info=selectedLeader;
        data.engineers_info=selectedEngineer;
        data.client_name=bulkquery.client_name;
        data.architect_name=bulkquery.architect_name;
        data.project_status='save';
        data.save(function (err,result) {
            if (err) {
                return res.status(500).json({
                    title: 'An error occurred',
                    error: err
                });
            }
            else
            {

                var aggregateArray=[];
                aggregateArray.push(
                    { $unwind :  "$team_info" },
                    { $match : {'team_info.email_id' : req.userEmail }}
                ); 
                aggregateArray.push({
                    $group:
                    {
                        _id:{'_id':'$_id','project_name':'$project_name','project_status':'$project_status','manager_info':'$manager_info','leader_info':'$leader_info','engineers_info':'$engineers_info'}
                    }
                    },
                    {
                        $project:
                        {
                            _id:'$_id._id',
                            project_name:'$_id.project_name',
                            project_status:'$_id.project_status',
                            manager_info:'$_id.manager_info',
                            leader_info:'$_id.leader_info',
                            engineers_info:'$_id.engineers_info'
                        }
                    },
                    { 
                        $sort : { "_id" : -1}
                    }
                );
                QC.Project.aggregate(aggregateArray, function (err, result) {
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
            }
        }); 
    });
});

router.get('/qc/getprojectcheckpoints/:pid/:rid/:did/:rvid/:tab', jwtAuth,function (req, res, next) {
 
    if(req.params.tab=='self')
    {
        QC.Project.aggregate([
            { $match:{"_id":{ $eq: ObjectId(req.params.pid) }}},    
            { $unwind: '$revision_info' },
            { $match:{"revision_info._id":{ $eq: ObjectId(req.params.rid) }}},    
            { $unwind: '$revision_info.deliverable_info' },
            { $match:{"revision_info.deliverable_info._id":{ $eq: ObjectId(req.params.did) }}},  
            { $unwind: '$revision_info.deliverable_info.review_info' },
            { $match:{"revision_info.deliverable_info.review_info._id":{ $eq: ObjectId(req.params.rvid) }}},  
            { $unwind: '$revision_info.deliverable_info.review_info.self_qc_info' },
            {
                $group:
                {
                    _id: {'_id':'$revision_info.deliverable_info.review_info.self_qc_info._id','checkpoint_name':'$revision_info.deliverable_info.review_info.self_qc_info.check_point_name','error_class':'$revision_info.deliverable_info.review_info.self_qc_info.error_class','created_by':'$revision_info.deliverable_info.review_info.self_qc_info.created_by','error_impact':'$revision_info.deliverable_info.review_info.self_qc_info.error_impact','se_answer':'$revision_info.deliverable_info.review_info.self_qc_info.se_answer','service_info':'$revision_info.deliverable_info.review_info.self_qc_info.service_info','system_info':'$revision_info.deliverable_info.review_info.self_qc_info.system_info','item_info':'$revision_info.deliverable_info.review_info.self_qc_info.item_info','main_category_info':'$revision_info.deliverable_info.review_info.self_qc_info.main_category_info','sub_category_info':'$revision_info.deliverable_info.review_info.self_qc_info.sub_category_info','parameter_info':'$revision_info.deliverable_info.review_info.self_qc_info.parameter_info','code_info':'$revision_info.deliverable_info.review_info.self_qc_info.code_info','notes_info':'$revision_info.deliverable_info.review_info.self_qc_info.notes_info','cp_remarks':'$revision_info.deliverable_info.review_info.self_qc_info.cp_remarks','cp_comments':'$revision_info.deliverable_info.review_info.self_qc_info.cp_comments'}
                }
            },
            {
                $project:
                {
                    _id:'$_id._id',
                    checkpoint_name:'$_id.checkpoint_name',
                    created_by:'$_id.created_by',
                    error_class:'$_id.error_class',
                    error_impact:'$_id.error_impact',
                    se_answer:'$_id.se_answer',
                    service_info:'$_id.service_info',
                    system_info:'$_id.system_info',
                    item_info:'$_id.item_info',
                    main_category_info:'$_id.main_category_info',
                    sub_category_info:'$_id.sub_category_info',
                    parameter_info:'$_id.parameter_info',
                    code_info:'$_id.code_info',
                    notes_info:'$_id.notes_info',
                    cp_remarks:'$_id.cp_remarks',
                    cp_comments:'$_id.cp_comments'
                }
            },
            { 
                $sort : { _id : 1}
            }
        ], function (err, result) {
            if (err) {
                next(err);
            } 
            else 
            {
                var ansArray=[];
                result.forEach(function(item){
                    ansArray.push({
                        cpid:item._id,
                        ans:item.se_answer,
                        error_class:item.error_class
                    })
                });

                QC.Project.findById(ObjectId(req.params.pid),function(err, data){  
                    var t=data.revision_info.id(ObjectId(req.params.rid)).deliverable_info.id(ObjectId(req.params.did)).review_info.id(ObjectId(req.params.rvid));
                    var t1=data.revision_info.id(ObjectId(req.params.rid)).deliverable_info.id(ObjectId(req.params.did));

                    var reveiwList=[];
                    data.revision_info.id(ObjectId(req.params.rid)).deliverable_info.id(ObjectId(req.params.did)).review_info.forEach(function(item){
                        reveiwList.push({
                            review_id:item._id,
                            review_name:item.review_name,
                            submission_status:item.submission_status
                        });
                    });

                    res.status(201).json({
                        checkPointsList:result,
                        ansArray:ansArray,
                        project_name:data.project_name,
                        drawing_number:t1.drawing_number,
                        drawing_title:t1.drawing_title,
                        prepared_by:t.prepared_by,
                        submission_status:t.submission_status,
                        reviewed_by:t.reviewed_by,
                        reviewed_status:t.reviewed_status,
                        approved_by:t.approved_by,
                        approved_status:t.approved_status,
                        selfqc_marks:t.selfqc_marks,
                        peerqc_marks:t.peerqc_marks,
                        reveiwList:reveiwList
                    });
                });
            }
        });
    }
    else if(req.params.tab=='peer')
    {
        QC.Project.aggregate([
            { $match:{"_id":{ $eq: ObjectId(req.params.pid) }}},    
            { $unwind: '$revision_info' },
            { $match:{"revision_info._id":{ $eq: ObjectId(req.params.rid) }}},    
            { $unwind: '$revision_info.deliverable_info' },
            { $match:{"revision_info.deliverable_info._id":{ $eq: ObjectId(req.params.did) }}},  
            { $unwind: '$revision_info.deliverable_info.review_info' },
            { $match:{"revision_info.deliverable_info.review_info._id":{ $eq: ObjectId(req.params.rvid) }}},  
            { $unwind: '$revision_info.deliverable_info.review_info.peer_qc_info' },
            {
                $group:
                {
                    _id: {'_id':'$revision_info.deliverable_info.review_info.peer_qc_info._id','checkpoint_name':'$revision_info.deliverable_info.review_info.peer_qc_info.check_point_name','error_class':'$revision_info.deliverable_info.review_info.peer_qc_info.error_class','error_impact':'$revision_info.deliverable_info.review_info.peer_qc_info.error_impact','created_by':'$revision_info.deliverable_info.review_info.peer_qc_info.created_by','qe_answer':'$revision_info.deliverable_info.review_info.peer_qc_info.qe_answer','se_answer':'$revision_info.deliverable_info.review_info.peer_qc_info.se_answer','service_info':'$revision_info.deliverable_info.review_info.peer_qc_info.service_info','system_info':'$revision_info.deliverable_info.review_info.peer_qc_info.system_info','item_info':'$revision_info.deliverable_info.review_info.peer_qc_info.item_info','main_category_info':'$revision_info.deliverable_info.review_info.peer_qc_info.main_category_info','sub_category_info':'$revision_info.deliverable_info.review_info.peer_qc_info.sub_category_info','parameter_info':'$revision_info.deliverable_info.review_info.peer_qc_info.parameter_info','code_info':'$revision_info.deliverable_info.review_info.peer_qc_info.code_info','notes_info':'$revision_info.deliverable_info.review_info.peer_qc_info.notes_info','cp_remarks':'$revision_info.deliverable_info.review_info.peer_qc_info.cp_remarks','cp_comments':'$revision_info.deliverable_info.review_info.peer_qc_info.cp_comments'}
                }
            },
            {
                $project:
                {
                    _id:'$_id._id',
                    checkpoint_name:'$_id.checkpoint_name',
                    created_by:'$_id.created_by',
                    error_class:'$_id.error_class',
                    error_impact:'$_id.error_impact',
                    se_answer:'$_id.se_answer',
                    qe_answer:'$_id.qe_answer',
                    service_info:'$_id.service_info',
                    system_info:'$_id.system_info',
                    item_info:'$_id.item_info',
                    main_category_info:'$_id.main_category_info',
                    sub_category_info:'$_id.sub_category_info',
                    parameter_info:'$_id.parameter_info',
                    code_info:'$_id.code_info',
                    notes_info:'$_id.notes_info',
                    cp_remarks:'$_id.cp_remarks',
                    cp_comments:'$_id.cp_comments'
                }
            },
            { 
                $sort : { _id : 1}
            }
        ], function (err, result) {
            if (err) {
                next(err);
            } 
            else 
            {
                var ansArray=[];
                result.forEach(function(item){
                    ansArray.push({
                        cpid:item._id,
                        ans:item.qe_answer,
                        seans:item.se_answer,
                        error_class:item.error_class
                    })
                });

                QC.Project.findById(ObjectId(req.params.pid),function(err, data){  
                    var t=data.revision_info.id(ObjectId(req.params.rid)).deliverable_info.id(ObjectId(req.params.did)).review_info.id(ObjectId(req.params.rvid));
                    var t1=data.revision_info.id(ObjectId(req.params.rid)).deliverable_info.id(ObjectId(req.params.did));
                   
                    var reveiwList=[];
                    data.revision_info.id(ObjectId(req.params.rid)).deliverable_info.id(ObjectId(req.params.did)).review_info.forEach(function(item){
                        reveiwList.push({
                            review_id:item._id,
                            review_name:item.review_name,
                            submission_status:item.submission_status
                        });
                    });

                    res.status(201).json({
                        checkPointsList:result,
                        ansArray:ansArray,
                        project_name:data.project_name,
                        drawing_number:t1.drawing_number,
                        drawing_title:t1.drawing_title,
                        prepared_by:t.prepared_by,
                        submission_status:t.submission_status,
                        reviewed_by:t.reviewed_by,
                        reviewed_status:t.reviewed_status,
                        approved_by:t.approved_by,
                        approved_status:t.approved_status,
                        selfqc_marks:t.selfqc_marks,
                        peerqc_marks:t.peerqc_marks,
                        reveiwList:reveiwList
                    });
                });
            }
        });
    }
});

router.post('/qc/changedeliverablestatus/:pid/:rid/:did/:rvid/:tab/:dstatus/:uname/:acclevel', jwtAuth,function (req, res, next) {
    var bulkquery=req.body;
    QC.Logic.findOne({}, function(err, data1) {
        QC.Project.findById(ObjectId(req.params.pid),function(err, data){  
            var t=data.revision_info.id(ObjectId(req.params.rid)).deliverable_info.id(ObjectId(req.params.did)).review_info.id(ObjectId(req.params.rvid));

            var noof_newminor=bulkquery.filter(function (item) { return item.ans == 'No' && item.error_class=='New Minor' }).length;
            var noof_newmajor=bulkquery.filter(function (item) { return item.ans == 'No' && item.error_class=='New Major' }).length;
            var noof_newcritical=bulkquery.filter(function (item) { return item.ans == 'No' && item.error_class=='New Critical' }).length;
            var noof_repeatmajor=bulkquery.filter(function (item) { return item.ans == 'No' && item.error_class=='Repeat Major' }).length;
            var noof_repeatminor=bulkquery.filter(function (item) { return item.ans == 'No' && item.error_class=='Repeat Minor' }).length;
            var noof_repeatcritical=bulkquery.filter(function (item) { return item.ans == 'No' && item.error_class=='Repeat Critical' }).length;

            if(req.params.tab=='self')
            {
                t.selfqc_marks = (100-(noof_newminor * data1.new_minor)-(noof_newmajor * data1.new_major)-(noof_newcritical * data1.new_cirtical)-(noof_repeatminor * data1.repeat_minor)-(noof_repeatmajor * data1.repeat_major)-(noof_repeatcritical * data1.repeat_cirtical));
                bulkquery.forEach(function(item){
                    t.self_qc_info.id(item.cpid).se_answer=item.ans;
                });
                t.prepared_by=req.params.uname;
                t.submission_status='Submitted';
                t.prepared_date=new Date();
                var subDocument=[];
                t.self_qc_info.forEach(function(item){

                    var impacts=[];
                    var services=[];
                    var systems=[];
                    var items=[];
                    var mcatgs=[];
                    var scatgs=[];
                    var parameters=[];
                    var codes=[];
                    var noteInfo=[];
                    
                    item.error_impact.forEach(function(im){
                        impacts.push({
                            '_id':new ObjectId(),
                            type_name:im.type_name
                        });
                    });

                    item.service_info.forEach(function(s){
                        services.push({
                            '_id':new ObjectId(),
                            service_name:s.service_name
                        });
                    });
        
                    item.system_info.forEach(function(si){
                        systems.push({
                            '_id':new ObjectId(),
                            system_name:si.system_name
                        });
                    });
        
                    item.item_info.forEach(function(ii){
                        items.push({
                            '_id':new ObjectId(),
                            item_name:ii.item_name
                        });
                    });
        
                    item.main_category_info.forEach(function(mi){
                        mcatgs.push({
                            '_id':new ObjectId(),
                            main_category_name:mi.main_category_name
                        });
                    });
        
                    item.sub_category_info.forEach(function(sc){
                        scatgs.push({
                            '_id':new ObjectId(),
                            sub_category_name:sc.sub_category_name
                        });
                    });
        
                    item.parameter_info.forEach(function(pi){
                        parameters.push({
                            '_id':new ObjectId(),
                            parameter_name:pi.parameter_name
                        });
                    });
        
                    item.code_info.forEach(function(ci){
                        codes.push({
                            '_id':new ObjectId(),
                            code_name:ci.code_name
                        });
                    });
        
                    item.notes_info.forEach(function(item2){
                        var fileInfo=[];
                        item2.file_info.forEach(function(item1){
                            fileInfo.push({
                                '_id':new ObjectId(),
                                file_url:item1.file_url,
                                file_type:item1.file_type,
                            }); 
                        });
                        noteInfo.push({
                            '_id':new ObjectId(),
                            notes_desc:item2.notes_desc,
                            created_by:item2.created_by,
                            created_date:item2.created_date,
                            file_info:fileInfo
                        });
                    });
                    
                    subDocument.push({
                        '_id':new ObjectId(),
                        check_point_name:item.check_point_name,
                        error_class:item.error_class,
                        error_impact:impacts,
                        check_point_from:item.check_point_from,
                        created_by:item.created_by,
                        mismatch_answer:'',
                        qe_answer:'',
                        se_answer:item.se_answer,
                        service_info:services,
                        system_info:systems,
                        item_info:items,
                        main_category_info:mcatgs,
                        sub_category_info:scatgs,
                        parameter_info:parameters,
                        code_info:codes,
                        notes_info:noteInfo,
                        cp_remarks:'',
                        cp_comments:''
                    });
                });
                t.peer_qc_info=subDocument;
                var r=data.revision_info.id(ObjectId(req.params.rid)).deliverable_info.id(ObjectId(req.params.did));
                r.deliverable_status='Submitted';
                data.save(function(err, result) { 
                    if (err) {
                        return res.status(500).json({
                            title: 'An error occurred',
                            error: err
                        });
                    }
                    let mailOptions = {
                        from: '"INNOWELL" <innowellinternational@gmail.com>', // sender address
                        to: r.leader_email, // list of receivers
                        subject: 'Enthiran VPC Deliverable - Submission', // Subject line
                        text: 'Deliverable Submission', // plain text body
                        html: 'Dear '+r.team_leader+',<br><p>The deliverable <b>'+r.drawing_number+'</b> of project <b>'+data.project_name+'</b> has been submitted by '+req.userName+'. You are requested to review.</p><br> Link: <a href="https://enthiran.jupiterbrothers.com//">https://enthiran.jupiterbrothers.com</a> ' // html body
                    };
                    // send mail with defined transport object
                    transporter.sendMail(mailOptions, (error, info) => {
                        if (error) {
                            return console.log(error);
                        }
                        console.log('Message %s sent: %s', info.messageId, info.response);
                        res.status(201).json({
                            msg:'saved',
                            selfqc_marks:t.selfqc_marks,
                            prepared_by:t.prepared_by,
                            submission_status:t.submission_status
                        });
                    });
                });
            }
            else if(req.params.tab=='peer' && req.params.acclevel=='Team Leader')
            {
                t.peerqc_marks = (100-(noof_newminor * data1.new_minor)-(noof_newmajor * data1.new_major)-(noof_newcritical * data1.new_cirtical)-(noof_repeatminor * data1.repeat_minor)-(noof_repeatmajor * data1.repeat_major)-(noof_repeatcritical * data1.repeat_cirtical));
                t.diffqc_marks=t.selfqc_marks-t.peerqc_marks;
                t.finalqc_marks=t.peerqc_marks-t.diffqc_marks;
                bulkquery.forEach(function(item){
                    t.peer_qc_info.id(item.cpid).qe_answer=item.ans;
                });
                t.reviewed_by=req.params.uname;
                t.reviewed_status='Reviewed';
                t.reviewed_date=new Date();
                var r=data.revision_info.id(ObjectId(req.params.rid)).deliverable_info.id(ObjectId(req.params.did));
                r.deliverable_status='Reviewed';

                data.save(function(err, result) { 
                    if (err) {
                        return res.status(500).json({
                            title: 'An error occurred',
                            error: err
                        });
                    }
                    let mailOptions = {
                        from: '"INNOWELL" <innowellinternational@gmail.com>', // sender address
                        to: r.manager_email, // list of receivers
                        subject: 'Enthiran VPC Deliverable - Review', // Subject line
                        text: 'Deliverable Review', // plain text body
                        html: 'Dear '+r.team_manager+',<br><p>The deliverable <b>'+r.drawing_number+'</b> of project <b>'+data.project_name+'</b> has been reviewed by '+req.userName+'. You are requested to approve.</p> <br> Link: <a href="https://enthiran.jupiterbrothers.com//">https://enthiran.jupiterbrothers.com</a> ' // html body
                    };
                    // send mail with defined transport object
                    transporter.sendMail(mailOptions, (error, info) => {
                        if (error) {
                            return console.log(error);
                        }
                        console.log('Message %s sent: %s', info.messageId, info.response);
                        res.status(201).json({
                            msg:'saved',
                            peerqc_marks:t.peerqc_marks,
                            reviewed_by:t.reviewed_by,
                            reviewed_status:t.reviewed_status
                        });
                    });
                });
            }
            else if(req.params.tab=='peer' && req.params.acclevel=='Manager')
            {
                t.approved_by=req.params.uname;
                t.approved_status='Approved';
                t.approved_date=new Date();
                var r=data.revision_info.id(ObjectId(req.params.rid)).deliverable_info.id(ObjectId(req.params.did));
                r.deliverable_status='Approved';
                data.save(function(err, result) { 
                    if (err) {
                        return res.status(500).json({
                            title: 'An error occurred',
                            error: err
                        });
                    }
                    let mailOptions = {
                        from: '"INNOWELL" <innowellinternational@gmail.com>', // sender address
                        to: r.engineer_email, // list of receivers
                        cc: r.leader_email,
                        subject: 'Enthiran VPC Deliverable - Approved', // Subject line
                        text: 'Deliverable Approved', // plain text body
                        html: 'Dear '+r.service_engineer+',<br><p>The deliverable <b> '+r.drawing_number+' </b> of project <b> '+data.project_name+' </b> has been approved by '+req.userName+'. Congratulation for good job.</p> <br> Link: <a href="https://enthiran.jupiterbrothers.com//">https://enthiran.jupiterbrothers.com</a> ' // html body
                    };
                    // send mail with defined transport object
                    transporter.sendMail(mailOptions, (error, info) => {
                        if (error) {
                            return console.log(error);
                        }
                        console.log('Message %s sent: %s', info.messageId, info.response);
                        res.status(201).json({
                            msg:'saved',
                            approved_by:t.approved_by,
                            approved_status:t.approved_status
                        });
                    });
                });
            }
        });
    });
});

router.post('/qc/rejectdeliverable/:pid/:rid/:did/:rvid', jwtAuth,function (req, res, next) {
    QC.Logic.findOne({}, function(err, data1) {
        QC.Project.findById(ObjectId(req.params.pid),function(err, data){  
            var t=data.revision_info.id(ObjectId(req.params.rid)).deliverable_info.id(ObjectId(req.params.did)).review_info;
            var r=t.id(ObjectId(req.params.rvid));
            if(req.userAccess=='Team Leader')
            {
                var bulkquery=req.body;
                var noof_newminor=bulkquery.filter(function (item) { return item.ans == 'No' && item.error_class=='New Minor' }).length;
                var noof_newmajor=bulkquery.filter(function (item) { return item.ans == 'No' && item.error_class=='New Major' }).length;
                var noof_newcritical=bulkquery.filter(function (item) { return item.ans == 'No' && item.error_class=='New Critical' }).length;
                var noof_repeatmajor=bulkquery.filter(function (item) { return item.ans == 'No' && item.error_class=='Repeat Major' }).length;
                var noof_repeatminor=bulkquery.filter(function (item) { return item.ans == 'No' && item.error_class=='Repeat Minor' }).length;
                var noof_repeatcritical=bulkquery.filter(function (item) { return item.ans == 'No' && item.error_class=='Repeat Critical' }).length;

                r.peerqc_marks = (100-(noof_newminor * data1.new_minor)-(noof_newmajor * data1.new_major)-(noof_newcritical * data1.new_cirtical)-(noof_repeatminor * data1.repeat_minor)-(noof_repeatmajor * data1.repeat_major)-(noof_repeatcritical * data1.repeat_cirtical));
                r.diffqc_marks=r.selfqc_marks-r.peerqc_marks;
                r.finalqc_marks=r.peerqc_marks-r.diffqc_marks;
                bulkquery.forEach(function(item){
                    r.peer_qc_info.id(item.cpid).qe_answer=item.ans;
                });
                r.reviewed_status='Rejected';
                r.reviewed_by=req.userName;
            }
            else if(req.userAccess=='Manager')
            {
                r.approved_status='Rejected';
                r.approved_by=req.userName;
            }
            
            var subDocument=[];
            r.self_qc_info.forEach(function(item){
                var impacts=[];
                var services=[];
                var systems=[];
                var items=[];
                var mcatgs=[];
                var scatgs=[];
                var parameters=[];
                var codes=[];
                var noteInfo=[];

                item.error_impact.forEach(function(im){
                    impacts.push({
                        '_id':new ObjectId(),
                        type_name:im.type_name
                    });
                });

                item.service_info.forEach(function(s){
                    services.push({
                        '_id':new ObjectId(),
                        service_name:s.service_name
                    });
                });

                item.system_info.forEach(function(si){
                    systems.push({
                        '_id':new ObjectId(),
                        system_name:si.system_name
                    });
                });

                item.item_info.forEach(function(ii){
                    items.push({
                        '_id':new ObjectId(),
                        item_name:ii.item_name
                    });
                });

                item.main_category_info.forEach(function(mi){
                    mcatgs.push({
                        '_id':new ObjectId(),
                        main_category_name:mi.main_category_name
                    });
                });

                item.sub_category_info.forEach(function(sc){
                    scatgs.push({
                        '_id':new ObjectId(),
                        sub_category_name:sc.sub_category_name
                    });
                });

                item.parameter_info.forEach(function(pi){
                    parameters.push({
                        '_id':new ObjectId(),
                        parameter_name:pi.parameter_name
                    });
                });

                item.code_info.forEach(function(ci){
                    codes.push({
                        '_id':new ObjectId(),
                        code_name:ci.code_name
                    });
                });

                item.notes_info.forEach(function(item2){
                    var fileInfo=[];
                    item2.file_info.forEach(function(item1){
                        fileInfo.push({
                            '_id':new ObjectId(),
                            file_url:item1.file_url,
                            file_type:item1.file_type,
                        }); 
                    });
                    noteInfo.push({
                        '_id':new ObjectId(),
                        notes_desc:item2.notes_desc,
                        created_by:item2.created_by,
                        created_date:item2.created_date,
                        file_info:fileInfo
                    });
                });

                subDocument.push({
                    '_id':new ObjectId(),
                    check_point_name:item.check_point_name,
                    error_class:item.error_class,
                    error_impact:impacts,
                    check_point_from:item.check_point_from,
                    created_by:item.created_by,
                    mismatch_answer:'',
                    qe_answer:'',
                    se_answer:'',
                    service_info:services,
                    system_info:systems,
                    item_info:items,
                    main_category_info:mcatgs,
                    sub_category_info:scatgs,
                    parameter_info:parameters,
                    code_info:codes,
                    notes_info:noteInfo,
                    cp_remarks:'',
                    cp_comments:''
                });
            });

            var str=r.review_name;
            var new_review = "IR"+ (parseInt(str.substring(2))+1);
            t.push({
                '_id':new ObjectId(),
                review_name:new_review,
                created_by:req.userName,
                created_date:new Date(),
                prepared_by:'',
                prepared_date:'',
                submission_status:'',
                reviewed_by:'',
                reviewed_status:'',
                reviewed_date:'',
                approved_by:'',
                approved_date:'',
                approved_status:'',
                selfqc_marks:0,
                peerqc_marks:0,
                diffqc_marks:0,
                finalqc_marks:0,
                revision_time:0,
                qc_remarks:'',
                self_qc_info:subDocument,
                peer_qc_info:[]
            });
            var d=data.revision_info.id(ObjectId(req.params.rid)).deliverable_info.id(ObjectId(req.params.did));
            d.deliverable_status='Rejected';
            data.save(function(err, result) { 
                if (err) {
                    return res.status(500).json({
                        title: 'An error occurred',
                        error: err
                    });
                }
                let mailOptions = {
                    from: '"INNOWELL" <innowellinternational@gmail.com>', // sender address
                    to: d.engineer_email, // list of receivers
                    cc: d.leader_email,
                    subject: 'Enthiran VPC - Rejected', // Subject line
                    text: 'Deliverable Rejected', // plain text body
                    html: 'Dear '+d.service_engineer+',<br><p>The deliverable <b>'+d.drawing_number+'</b> of project <b>'+data.project_name+'</b> has been rejected by '+req.userName+'. You are requested to revise and resubmit.</p>  <br> Link: <a href="https://enthiran.jupiterbrothers.com//">https://enthiran.jupiterbrothers.com</a>' // html body
                };
                // send mail with defined transport object
                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        return console.log(error);
                    }
                    console.log('Message %s sent: %s', info.messageId, info.response);
                    res.status(201).json({
                        msg:'saved',
                        reviewed_by:r.reviewed_by,
                        reviewed_status:r.reviewed_status,
                        approved_by:r.approved_by,
                        approved_status:r.approved_status
                    });
                });
            });
        });
    });
});

router.get('/qc/changecomments/:pid/:rid/:did/:rvid/:cpid/:comments', jwtAuth,function (req, res, next) {
    QC.Project.findById(ObjectId(req.params.pid),function(err, data){  
       data.revision_info.id(ObjectId(req.params.rid)).deliverable_info.id(ObjectId(req.params.did)).review_info.id(ObjectId(req.params.rvid)).peer_qc_info.id(ObjectId(req.params.cpid)).cp_comments=req.params.comments;
        data.save(function(err, result) { 
            if (err) {
                return res.status(500).json({
                    title: 'An error occurred',
                    error: err
                });
            }
            res.status(201).json({
                msg:'saved'
            });
        });
    });
});

router.get('/qc/showcomments/:pid/:rid/:did/:rvid/:cpid', jwtAuth,function (req, res, next) {
    QC.Project.findById(ObjectId(req.params.pid),function(err, data){  
        res.status(201).json({
            comments:data.revision_info.id(ObjectId(req.params.rid)).deliverable_info.id(ObjectId(req.params.did)).review_info.id(ObjectId(req.params.rvid)).peer_qc_info.id(ObjectId(req.params.cpid)).cp_comments
        });
    });
});

router.get('/qc/selectrevision/:pid/:rid',jwtAuth,function (req, res, next) {
    QC.Project.aggregate([
        { $match:{"_id":{ $eq: ObjectId(req.params.pid) }}},    
        { $unwind: '$revision_info' },
        { $match:{"revision_info._id":{ $eq: ObjectId(req.params.rid) }}},    
        {
            $group:
            {
                _id: {'_id':'$project_name'},
                lastrevision: { $last: "$revision_info" } 
            }
        },
        { $unwind: '$lastrevision' },
        { $unwind: '$lastrevision.deliverable_info' },
        { $match:{"lastrevision.deliverable_info.deliverable_status":{ $ne: "draft" }}},
        { $unwind: '$lastrevision.deliverable_info.review_info' },
        {
            $group:
            {
                _id: {'_id':'$lastrevision.deliverable_info._id','drawing_number':'$lastrevision.deliverable_info.drawing_number','drawing_title':'$lastrevision.deliverable_info.drawing_title','delivered_date':'$lastrevision.deliverable_info.delivered_date','team_leader':'$lastrevision.deliverable_info.team_leader','service_engineer':'$lastrevision.deliverable_info.service_engineer','deliverable_status':'$lastrevision.deliverable_info.deliverable_status','checkpoint_exsit':'$lastrevision.deliverable_info.checkpoint_exsit'},
                lastreview: { $last: "$lastrevision.deliverable_info.review_info" } 
            }
        },
        { $unwind: '$lastreview' },
        {
            $group:
            {
                _id: {'_id':'$_id._id','drawing_number':'$_id.drawing_number','drawing_title':'$_id.drawing_title','delivered_date':'$_id.delivered_date','team_leader':'$_id.team_leader','service_engineer':'$_id.service_engineer','deliverable_status':'$_id.deliverable_status','checkpoint_exsit':'$_id.checkpoint_exsit','review_id':'$lastreview._id','review_name':'$lastreview.review_name'},
            }
        },
        {
            $project:
            {
                _id:'$_id._id',
                drawing_number:'$_id.drawing_number',
                drawing_title:'$_id.drawing_title',
                delivered_date:'$_id.delivered_date',
                team_leader:'$_id.team_leader',
                service_engineer:'$_id.service_engineer',
                deliverable_status:'$_id.deliverable_status',
                checkpoint_exsit:'$_id.checkpoint_exsit',
                review_id:'$_id.review_id',
                review_name:'$_id.review_name'
            }
        }
    ], function (err, result) {
        if (err) {
            next(err);
        } 
        else 
        {
            res.status(201).json({
                deliverableList:result
            }); 
        }
    });
});

router.get('/qc/createrevision/:pid',jwtAuth,function (req, res, next) {
    QC.Project.findById(ObjectId(req.params.pid),function(err, data){  

        var revid=data.revision_info[data.revision_info.length-1]._id;
       
        var t1=data.revision_info.id(ObjectId(revid)).deliverable_info;
        var newDeliverableDoc=[];
        t1.forEach(function(t){
            var selectedDelSubCategory=[];
            if(t.deliverable_subcategory.length>0)
            {
                t.deliverable_subcategory.forEach(function(item){
                    selectedDelSubCategory.push({
                        '_id':new ObjectId(),
                        deliverable_sub_category:item.deliverable_sub_category
                    });
                });
            }

            var selectedService=[];
            if(t.deliverable_services.length>0)
            {
                t.deliverable_services.forEach(function(item){
                    selectedService.push({
                        '_id':new ObjectId(),
                        service_name:item.service_name
                    });
                });
            }

            var selectedSystem=[];
            if(t.deliverable_systems.length>0)
            {
                t.deliverable_systems.forEach(function(item){
                    selectedSystem.push({
                        '_id':new ObjectId(),
                        system_name:item.system_name
                    });
                });
            }

            var selectedItem=[];
            if(t.deliverable_items.length>0)
            {
                t.deliverable_items.forEach(function(item){
                    selectedItem.push({
                        '_id':new ObjectId(),
                        item_name:item.item_name
                    });
                });
            }

            var selectedMainCatg=[];
            if(t.deliverable_main_category.length>0)
            {
                t.deliverable_main_category.forEach(function(item){
                    selectedMainCatg.push({
                        '_id':new ObjectId(),
                        main_category_name:item.main_category_name
                    });
                });
            }

            var selectedSubCatg=[];
            if(t.deliverable_sub_category.length>0)
            {
                t.deliverable_sub_category.forEach(function(item){
                    selectedSubCatg.push({
                        '_id':new ObjectId(),
                        sub_category_name:item.sub_category_name
                    });
                });
            }

            var selectedParameter=[];
            if(t.deliverable_parameter.length>0)
            {
                t.deliverable_parameter.forEach(function(item){
                    selectedParameter.push({
                        '_id':new ObjectId(),
                        parameter_name:item.parameter_name
                    });
                });
            }

            var selectedCode=[];
            if(t.deliverable_codes.length>0)
            {
                t.deliverable_codes.forEach(function(item){
                    selectedCode.push({
                        '_id':new ObjectId(),
                        code_name:item.code_name
                    });
                });
            }

            var selfqcinfo=t.review_info[t.review_info.length-1].self_qc_info;
            var subDocument=[];
            selfqcinfo.forEach(function(item){
                var impacts=[];
                var services=[];
                var systems=[];
                var items=[];
                var mcatgs=[];
                var scatgs=[];
                var parameters=[];
                var codes=[];
                var noteInfo=[];

                item.error_impact.forEach(function(im){
                    impacts.push({
                        '_id':new ObjectId(),
                        type_name:im.type_name
                    });
                });

                item.service_info.forEach(function(s){
                    services.push({
                        '_id':new ObjectId(),
                        service_name:s.service_name
                    });
                });

                item.system_info.forEach(function(si){
                    systems.push({
                        '_id':new ObjectId(),
                        system_name:si.system_name
                    });
                });

                item.item_info.forEach(function(ii){
                    items.push({
                        '_id':new ObjectId(),
                        item_name:ii.item_name
                    });
                });

                item.main_category_info.forEach(function(mi){
                    mcatgs.push({
                        '_id':new ObjectId(),
                        main_category_name:mi.main_category_name
                    });
                });

                item.sub_category_info.forEach(function(sc){
                    scatgs.push({
                        '_id':new ObjectId(),
                        sub_category_name:sc.sub_category_name
                    });
                });

                item.parameter_info.forEach(function(pi){
                    parameters.push({
                        '_id':new ObjectId(),
                        parameter_name:pi.parameter_name
                    });
                });

                item.code_info.forEach(function(ci){
                    codes.push({
                        '_id':new ObjectId(),
                        code_name:ci.code_name
                    });
                });

                item.notes_info.forEach(function(item2){
                    var fileInfo=[];
                    item2.file_info.forEach(function(item1){
                        fileInfo.push({
                            '_id':new ObjectId(),
                            file_url:item1.file_url,
                            file_type:item1.file_type,
                        }); 
                    });
                    noteInfo.push({
                        '_id':new ObjectId(),
                        notes_desc:item2.notes_desc,
                        created_by:item2.created_by,
                        created_date:item2.created_date,
                        file_info:fileInfo
                    });
                });

                subDocument.push({
                    '_id':new ObjectId(),
                    check_point_name:item.checkpoint_name,
                    error_class:item.error_class,
                    error_impact:impacts,
                    check_point_from:item.check_point_from,
                    created_by:item.created_by,
                    mismatch_answer:'',
                    qe_answer:'',
                    se_answer:'',
                    service_info:services,
                    system_info:systems,
                    item_info:items,
                    main_category_info:mcatgs,
                    sub_category_info:scatgs,
                    parameter_info:parameters,
                    code_info:codes,
                    notes_info:noteInfo,
                    cp_remarks:'',
                    cp_comments:''
                });
            });

            newDeliverableDoc.push({
                '_id':new ObjectId(),
                drawing_number:t.drawing_number,
                drawing_title:t.drawing_title,
                deliverable_reference:t.deliverable_reference,
                deliverable_description:t.deliverable_description,
                deliverable_category:t.is_client_specific,
                deliverable_subcategory:selectedDelSubCategory,
                is_client_specific:t.is_client_specific,
                client_name:t.client_name,
                created_by:t.created_by,
                created_date:new Date(),
                delivered_date:new Date(t.delivered_date),
                team_leader:'',
                service_engineer:'',
                checkpoint_exsit:t.checkpoint_exsit,
                deliverable_services:selectedService,
                deliverable_systems:selectedSystem,
                deliverable_items:selectedItem,
                deliverable_main_category:selectedMainCatg,
                deliverable_sub_category:selectedSubCatg,
                deliverable_parameter:selectedParameter,
                deliverable_codes:selectedCode, 
                deliverable_status:'save',
                review_info:[{
                    '_id':new ObjectId(),
                    review_name:t.review_name,
                    created_by:t.created_by,
                    created_date:new Date(),
                    prepared_by:'',
                    prepared_date:'',
                    submission_status:'',
                    reviewed_by:'',
                    reviewed_status:'',
                    reviewed_date:'',
                    approved_by:'',
                    approved_date:'',
                    approved_status:'',
                    selfqc_marks:0,
                    peerqc_marks:0,
                    diffqc_marks:0,
                    finalqc_marks:0,
                    self_qc_info:subDocument,
                    peer_qc_info:[]
                }]
            });
        });

        var r=data.revision_info.id(ObjectId(revid));
        var str=r.revision_name;
        var new_revision = "R"+ (parseInt(str.substring(1))+1);

        var prjtServices=[];
        var prjtSystems=[];
        var prjtItems=[];
        var prjtMainCatg=[];
        var prjtSubCatg=[];
        var prjtParam=[];
        var prjtCode=[];

        r.project_services.forEach(function(s){
            prjtServices.push({
                '_id':new ObjectId(),
                service_name:s.service_name
            });
        });

        r.project_systems.forEach(function(s){
            prjtSystems.push({
                '_id':new ObjectId(),
                system_name:s.system_name
            });
        });

        r.project_items.forEach(function(s){
            prjtItems.push({
                '_id':new ObjectId(),
                item_name:s.item_name
            });
        });

        r.project_main_category.forEach(function(s){
            prjtMainCatg.push({
                '_id':new ObjectId(),
                main_category_name:s.main_category_name
            });
        });

        r.project_sub_category.forEach(function(s){
            prjtSubCatg.push({
                '_id':new ObjectId(),
                sub_category_name:s.sub_category_name
            });
        });

        r.project_parameter.forEach(function(s){
            prjtParam.push({
                '_id':new ObjectId(),
                parameter_name:s.parameter_name
            });
        });

        r.project_codes.forEach(function(s){
            prjtCode.push({
                '_id':new ObjectId(),
                code_name:s.code_name
            });
        });

        data.revision_info.push({
            '_id':new ObjectId(),
            revision_name:new_revision,
            revision_status:'save',
            created_by:r.created_by,
            created_date:new Date(),
            project_services:prjtServices,
            project_systems:prjtSystems,
            project_items:prjtItems,
            project_main_category:prjtMainCatg,
            project_sub_category:prjtSubCatg,
            project_parameter:prjtParam,
            project_codes:prjtCode,
            deliverable_info:newDeliverableDoc
        });
        data.save(function(err, result) { 
            if (err) {
                return res.status(500).json({
                    title: 'An error occurred',
                    error: err
                });
            }
            else
            {
                QC.Project.aggregate([
                    { $match:{"_id":{ $eq: ObjectId(req.params.pid) }}},    
                    { $unwind: '$revision_info' },
                    {
                        $group:
                        {
                            _id: {'_id':'$revision_info._id','revision_name':'$revision_info.revision_name'}
                        }
                    },
                    {
                        $project:
                        {
                            _id:'$_id._id',
                            revision_name:'$_id.revision_name'
                        }
                    },
                    {
                        $sort:{
                            _id:1
                        }
                    }
                ], function (err, result1) {
                    if (err) {
                        next(err);
                    } 
                    else 
                    {
                        QC.Project.aggregate([
                            { $match:{"_id":{ $eq: ObjectId(req.params.pid) }}},    
                            { $unwind: '$revision_info' },
                            {
                                $group:
                                {
                                    _id: {'_id':'$project_name'},
                                    lastrevision: { $last: "$revision_info" } 
                                }
                            },
                            { $unwind: '$lastrevision' },
                            { $unwind: '$lastrevision.deliverable_info' },
                            { $match:{"lastrevision.deliverable_info.deliverable_status":{ $ne: "draft" }}},
                            { $unwind: '$lastrevision.deliverable_info.review_info' },
                            {
                                $group:
                                {
                                    _id: {'_id':'$lastrevision.deliverable_info._id','drawing_number':'$lastrevision.deliverable_info.drawing_number','drawing_title':'$lastrevision.deliverable_info.drawing_title','delivered_date':'$lastrevision.deliverable_info.delivered_date','team_leader':'$lastrevision.deliverable_info.team_leader','service_engineer':'$lastrevision.deliverable_info.service_engineer','deliverable_status':'$lastrevision.deliverable_info.deliverable_status','checkpoint_exsit':'$lastrevision.deliverable_info.checkpoint_exsit'},
                                    lastreview: { $last: "$lastrevision.deliverable_info.review_info" } 
                                }
                            },
                            { $unwind: '$lastreview' },
                            {
                                $group:
                                {
                                    _id: {'_id':'$_id._id','drawing_number':'$_id.drawing_number','drawing_title':'$_id.drawing_title','delivered_date':'$_id.delivered_date','team_leader':'$_id.team_leader','service_engineer':'$_id.service_engineer','deliverable_status':'$_id.deliverable_status','checkpoint_exsit':'$_id.checkpoint_exsit','review_id':'$lastreview._id','review_name':'$lastreview.review_name'},
                                }
                            },
                            {
                                $project:
                                {
                                    _id:'$_id._id',
                                    drawing_number:'$_id.drawing_number',
                                    drawing_title:'$_id.drawing_title',
                                    delivered_date:'$_id.delivered_date',
                                    team_leader:'$_id.team_leader',
                                    service_engineer:'$_id.service_engineer',
                                    deliverable_status:'$_id.deliverable_status',
                                    checkpoint_exsit:'$_id.checkpoint_exsit',
                                    review_id:'$_id.review_id',
                                    review_name:'$_id.review_name'
                                }
                            }
                        ], function (err, result2) {
                            if (err) {
                                next(err);
                            } 
                            else 
                            {
                                res.status(201).json({
                                    revisionList:result1,
                                    deliverableList:result2
                                }); 
                            }
                        });
                    }
                });
            }
        }); 
    });
});

// Template Page

router.get('/qc/getcheckpoints', jwtAuth,function (req, res, next) {
    QC.Temp.aggregate([
        {
            $group:
            {
                _id: {'checkpoint_status':'$checkpoint_status'},
                checkpointInfo:
                {
                    $addToSet:
                    {
                        _id:'$_id',
                        checkpoint_status:'$checkpoint_status',
                        checkpoint_name:'$checkpoint_name',
                        created_by:'$created_by',
                        error_class:'$error_class',
                        error_impact:'$error_impact',
                        // current_page:'$current_page'
                    }
                }
            }
        },
        {
            $project:
            {
                _id:0,
                checkpoint_status:'$_id.checkpoint_status',
                checkpointInfo:'$checkpointInfo'
            }
        },
    ], function (err, result) {
        if (err) {
            next(err);
        } 
        else 
        {
           res.json(result);
        }
    });
});

router.post('/qc/savecheckpoint',jwtAuth, function (req, res, next) {
    
    var errorImpact=req.body.selectedErrorImpact;
    var clients=req.body.selectedClient;
    var countries=req.body.selectedCountry;
    var states=req.body.selectedState;
    var ptypes=req.body.selectedPType;
    var psubtypes=req.body.selectedPSubType;
    var services=req.body.selectedServices;
    var deliverables=req.body.selectedDeliverables;
    var subdeliverables=req.body.selectedSubDeliverables;
    var systems=req.body.selectedSystems;
    var items=req.body.selectedItems;
    var maincatgs=req.body.selectedMainCatg; 
    var subcatgs=req.body.selectedSubCatg;
    var parameters=req.body.selectedParameter;
    var codes=req.body.selectedCode;
    var checkpoint_status=req.body.checkpoint_status;
    var selectedErrorImpact=[];
    if(errorImpact.length>0)
    {
        errorImpact.forEach(function(item){
            selectedErrorImpact.push({
                '_id':new ObjectId(),
                type_name:item.name
            });
        });
    }
    
    var selectedClient=[];
    if(clients.length>0)
    {
        clients.forEach(function(item){
            selectedClient.push({
                '_id':new ObjectId(),
                type_name:item.name
            });
        });
    }

    var selectedCountry=[];
    if(countries.length>0)
    {
        countries.forEach(function(item){
            selectedCountry.push({
                '_id':new ObjectId(),
                type_name:item.name
            });
        });
    }

    var selectedState=[];
    if(states.length>0)
    {
        states.forEach(function(item){
            selectedState.push({
                '_id':new ObjectId(),
                type_name:item.name
            });
        });
    }

    var selectedPType=[];
    if(ptypes.length>0)
    {
        ptypes.forEach(function(item){
            selectedPType.push({
                '_id':new ObjectId(),
                type_name:item.name
            });
        });
    }
    
    var selectedPSubType=[];
    if(psubtypes.length>0)
    {
        psubtypes.forEach(function(item){
            selectedPSubType.push({
                '_id':new ObjectId(),
                type_name:item.name
            });
        });
    }

    var selectedServices=[];
    services.forEach(function(item){
        selectedServices.push({
            '_id':new ObjectId(),
            type_name:item.name
        });
    });

    var selectedDeliverables=[];
    if(deliverables.length>0)
    {
        deliverables.forEach(function(item){
            selectedDeliverables.push({
                '_id':new ObjectId(),
                type_name:item.name
            });
        });
    }

    var selectedSubDeliverables=[];
    if(subdeliverables.length>0)
    {
        subdeliverables.forEach(function(item){
            selectedSubDeliverables.push({
                '_id':new ObjectId(),
                type_name:item.name
            });
        });
    }

    var selectedSystems=[];
    if(systems.length>0)
    {
        systems.forEach(function(item){
            selectedSystems.push({
                '_id':new ObjectId(),
                type_name:item.name
            });
        });
    }

    var selectedItems=[];
    if(items.length>0)
    {
        items.forEach(function(item){
            selectedItems.push({
                '_id':new ObjectId(),
                type_name:item.name
            });
        });
    }

    var selectedMainCatg=[];
    if(maincatgs.length>0)
    {
        maincatgs.forEach(function(item){
            selectedMainCatg.push({
                '_id':new ObjectId(),
                type_name:item.name
            });
        });
    }

    var selectedSubCatg=[];
    if(subcatgs.length>0)
    {
        subcatgs.forEach(function(item){
            selectedSubCatg.push({
                '_id':new ObjectId(),
                type_name:item.name
            });
        });
    }

    var selectedParameter=[];
    if(parameters.length>0)
    {
        parameters.forEach(function(item){
            selectedParameter.push({
                '_id':new ObjectId(),
                type_name:item.name
            });
        });
    }

    var selectedCode=[];
    if(codes.length>0)
    {
        codes.forEach(function(item){
            selectedCode.push({
                '_id':new ObjectId(),
                type_name:item.name
            });
        });
    }

    if(req.body.status=='add')
    {
        var temp=new QC.Temp({
            checkpoint_name:req.body.checkpoint_name,
            error_class:req.body.error_class,
            error_impact:selectedErrorImpact,
            client_info:selectedClient,
            country_info:selectedCountry,
            state_info:selectedState,
            ptype_info:selectedPType,
            psubtype_info:selectedPSubType,
            service_info:selectedServices,
            deliverable_info:selectedDeliverables,
            subdeliverable_info:selectedSubDeliverables,
            system_info:selectedSystems,
            item_info:selectedItems,
            main_category_info:selectedMainCatg,
            sub_category_info:selectedSubCatg,
            parameter_info:selectedParameter,
            code_info:selectedCode,
            checkpoint_status:req.body.checkpoint_status,
            created_by:req.body.user_name,
            created_date:new Date()
        });
        temp.save(function (err,result) {
            if (err) {
                return res.status(500).json({
                    title: 'An error occurred',
                    error: err
                });
            }
            else
            {
                if(req.body.currentpage=='template')
                {
                    QC.Temp.aggregate([
                        {
                            $group:
                            {
                                _id: {'checkpoint_status':'$checkpoint_status'},
                                checkpointInfo:
                                {
                                    $addToSet:
                                    {
                                        _id:'$_id',
                                        checkpoint_status:'$checkpoint_status',
                                        checkpoint_name:'$checkpoint_name',
                                        created_by:'$created_by',
                                        error_class:'$error_class',
                                        error_impact:'$error_impact',
                                        // current_page:'$current_page'
                                    }
                                }
                            }
                        },
                        {
                            $project:
                            {
                                _id:0,
                                checkpoint_status:'$_id.checkpoint_status',
                                checkpointInfo:'$checkpointInfo'
                            }
                        },
                    ], function (err, result) {
                        if (err) {
                            next(err);
                        } 
                        else 
                        {
                           res.json(result);
                        }
                    });
                }
                else if(req.body.currentpage=='project')
                {
                   
                    QC.Project.findById(ObjectId(req.body.pid),function(err, data){  
                        var t=data.revision_info.id(ObjectId(req.body.rid)).deliverable_info.id(ObjectId(req.body.did)).review_info.id(ObjectId(req.body.rvid));
                        var r;
                       
                        if(req.body.tab=='self')
                        {
                            r=t.self_qc_info;
                        }
                        else if(req.body.tab=='peer')
                        {
                            r=t.peer_qc_info;
                        }
                        r.push({
                            check_point_name:req.body.checkpoint_name,
                            error_class:req.body.error_class,
                            error_impact:selectedErrorImpact,
                            check_point_from:'Project',
                            service_info:selectedServices,
                            system_info:selectedSystems,
                            item_info:selectedItems,
                            main_category_info:selectedMainCatg,
                            sub_category_info:selectedSubCatg,
                            parameter_info:selectedParameter,
                            code_info:selectedCode,
                            notes_info:[],
                            created_by:req.body.user_name
                        });
                        data.save(function (err,result) {
                            if (err) {
                                return res.status(500).json({
                                    title: 'An error occurred',
                                    error: err
                                });
                            }
                            else
                            {
                               
                                if(req.body.tab=='self')
                                {
                                    QC.Project.aggregate([
                                        { $match:{"_id":{ $eq: ObjectId(req.body.pid) }}},    
                                        { $unwind: '$revision_info' },
                                        { $match:{"revision_info._id":{ $eq: ObjectId(req.body.rid) }}},    
                                        { $unwind: '$revision_info.deliverable_info' },
                                        { $match:{"revision_info.deliverable_info._id":{ $eq: ObjectId(req.body.did) }}},  
                                        { $unwind: '$revision_info.deliverable_info.review_info' },
                                        { $match:{"revision_info.deliverable_info.review_info._id":{ $eq: ObjectId(req.body.rvid) }}},  
                                        { $unwind: '$revision_info.deliverable_info.review_info.self_qc_info' },
                                        {
                                            $group:
                                            {
                                                _id: {'_id':'$revision_info.deliverable_info.review_info.self_qc_info._id','checkpoint_name':'$revision_info.deliverable_info.review_info.self_qc_info.check_point_name','error_class':'$revision_info.deliverable_info.review_info.self_qc_info.error_class','created_by':'$revision_info.deliverable_info.review_info.self_qc_info.created_by','error_impact':'$revision_info.deliverable_info.review_info.self_qc_info.error_impact','se_answer':'$revision_info.deliverable_info.review_info.self_qc_info.se_answer','service_info':'$revision_info.deliverable_info.review_info.self_qc_info.service_info','system_info':'$revision_info.deliverable_info.review_info.self_qc_info.system_info','item_info':'$revision_info.deliverable_info.review_info.self_qc_info.item_info','main_category_info':'$revision_info.deliverable_info.review_info.self_qc_info.main_category_info','sub_category_info':'$revision_info.deliverable_info.review_info.self_qc_info.sub_category_info','parameter_info':'$revision_info.deliverable_info.review_info.self_qc_info.parameter_info','code_info':'$revision_info.deliverable_info.review_info.self_qc_info.code_info','notes_info':'$revision_info.deliverable_info.review_info.self_qc_info.notes_info','cp_remarks':'$revision_info.deliverable_info.review_info.self_qc_info.cp_remarks','cp_comments':'$revision_info.deliverable_info.review_info.self_qc_info.cp_comments'}
                                            }
                                        },
                                        {
                                            $project:
                                            {
                                                _id:'$_id._id',
                                                checkpoint_name:'$_id.checkpoint_name',
                                                created_by:'$_id.created_by',
                                                error_class:'$_id.error_class',
                                                error_impact:'$_id.error_impact',
                                                se_answer:'$_id.se_answer',
                                                service_info:'$_id.service_info',
                                                system_info:'$_id.system_info',
                                                item_info:'$_id.item_info',
                                                main_category_info:'$_id.main_category_info',
                                                sub_category_info:'$_id.sub_category_info',
                                                parameter_info:'$_id.parameter_info',
                                                code_info:'$_id.code_info',
                                                notes_info:'$_id.notes_info',
                                                cp_remarks:'$_id.cp_remarks',
                                                cp_comments:'$_id.cp_comments'
                                            }
                                        },
                                        { 
                                            $sort : { _id : 1}
                                        }
                                    ], function (err, result) {
                                        if (err) {
                                            next(err);
                                        } 
                                        else 
                                        {
                                            res.status(201).json({
                                                checkPointsList:result
                                            });
                                        }
                                    });
                                }
                                else if(req.body.tab=='peer')
                                {
                                    QC.Project.aggregate([
                                        { $match:{"_id":{ $eq: ObjectId(req.body.pid) }}},    
                                        { $unwind: '$revision_info' },
                                        { $match:{"revision_info._id":{ $eq: ObjectId(req.body.rid) }}},    
                                        { $unwind: '$revision_info.deliverable_info' },
                                        { $match:{"revision_info.deliverable_info._id":{ $eq: ObjectId(req.body.did) }}},  
                                        { $unwind: '$revision_info.deliverable_info.review_info' },
                                        { $match:{"revision_info.deliverable_info.review_info._id":{ $eq: ObjectId(req.body.rvid) }}},  
                                        { $unwind: '$revision_info.deliverable_info.review_info.peer_qc_info' },
                                        {
                                            $group:
                                            {
                                                _id: {'_id':'$revision_info.deliverable_info.review_info.peer_qc_info._id','checkpoint_name':'$revision_info.deliverable_info.review_info.peer_qc_info.check_point_name','error_class':'$revision_info.deliverable_info.review_info.peer_qc_info.error_class','error_impact':'$revision_info.deliverable_info.review_info.peer_qc_info.error_impact','created_by':'$revision_info.deliverable_info.review_info.peer_qc_info.created_by','qe_answer':'$revision_info.deliverable_info.review_info.peer_qc_info.qe_answer','se_answer':'$revision_info.deliverable_info.review_info.peer_qc_info.se_answer','service_info':'$revision_info.deliverable_info.review_info.peer_qc_info.service_info','system_info':'$revision_info.deliverable_info.review_info.peer_qc_info.system_info','item_info':'$revision_info.deliverable_info.review_info.peer_qc_info.item_info','main_category_info':'$revision_info.deliverable_info.review_info.peer_qc_info.main_category_info','sub_category_info':'$revision_info.deliverable_info.review_info.peer_qc_info.sub_category_info','parameter_info':'$revision_info.deliverable_info.review_info.peer_qc_info.parameter_info','code_info':'$revision_info.deliverable_info.review_info.peer_qc_info.code_info','notes_info':'$revision_info.deliverable_info.review_info.peer_qc_info.notes_info','cp_remarks':'$revision_info.deliverable_info.review_info.peer_qc_info.cp_remarks','cp_comments':'$revision_info.deliverable_info.review_info.peer_qc_info.cp_comments'}
                                            }
                                        },
                                        {
                                            $project:
                                            {
                                                _id:'$_id._id',
                                                checkpoint_name:'$_id.checkpoint_name',
                                                created_by:'$_id.created_by',
                                                error_class:'$_id.error_class',
                                                error_impact:'$_id.error_impact',
                                                se_answer:'$_id.se_answer',
                                                qe_answer:'$_id.qe_answer',
                                                service_info:'$_id.service_info',
                                                system_info:'$_id.system_info',
                                                item_info:'$_id.item_info',
                                                main_category_info:'$_id.main_category_info',
                                                sub_category_info:'$_id.sub_category_info',
                                                parameter_info:'$_id.parameter_info',
                                                code_info:'$_id.code_info',
                                                notes_info:'$_id.notes_info',
                                                cp_remarks:'$_id.cp_remarks',
                                                cp_comments:'$_id.cp_comments'
                                            }
                                        },
                                        { 
                                            $sort : { _id : 1}
                                        }
                                    ], function (err, result) {
                                        if (err) {
                                            next(err);
                                        } 
                                        else 
                                        {
                                            res.status(201).json({
                                                checkPointsList:result
                                            });
                                        }
                                    });
                                }
                            }
                        }); 
                    });
                }
            }
        });
    }
    else if(req.body.status=='edit')
    {
        QC.Temp.findById(ObjectId(req.body.cpid),function(err, data){  
            data.edited_by=req.body.user_name;
            data.edited_date=new Date();
            data.checkpoint_name=req.body.checkpoint_name;
            data.error_class=req.body.error_class;
            data.error_impact=selectedErrorImpact;
            data.client_info=selectedClient;
            data.country_info=selectedCountry;
            data.state_info=selectedState;
            data.ptype_info=selectedPType;
            data.psubtype_info=selectedPSubType;
            data.service_info=selectedServices;
            data.deliverable_info=selectedDeliverables;
            data.subdeliverable_info=selectedSubDeliverables;
            data.system_info=selectedSystems;
            data.item_info=selectedItems;
            data.main_category_info=selectedMainCatg;
            data.sub_category_info=selectedSubCatg;
            data.parameter_info=selectedParameter;
            data.code_info=selectedCode;
    
            data.save(function(err, result) { 
                if (err) {
                    return res.status(500).json({
                        title: 'An error occurred',
                        error: err
                    });
                }
                QC.Temp.aggregate([
                    {
                        $group:
                        {
                            _id:{'_id':'$checkpoint_status'},
                            checkpoint_info:
                            {
                                $addToSet:
                                {
                                    _id:'$_id._id',
                                    dcheckpoint_name:'$_id.dcheckpoint_name',
                                    dcreated_by:'$_id.dcreated_by',
                                    derror_class:'$_id.derror_class',
                                    derror_impact:'$_id.derror_impact'
                                }
                            }
                        }
                    },
                    {
                        $project:
                        {
                            _id:'$_id._id',
                            checkpoint_info:'$checkpoint_info',
                        }
                    },
                    { 
                        $sort : { _id : 1}
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
        });
    }
});

router.get('/qc/approvecheckPoint/:cpid',jwtAuth, function (req, res, next) {
    QC.Temp.findById(ObjectId(req.params.cpid),function(err, data){  
        data.checkpoint_status='template';
        data.save(function (err,result) {
            if (err) {
                return res.status(500).json({
                    title: 'An error occurred',
                    error: err
                });
            }
            else
            {
                QC.Temp.aggregate([
                    {
                        $group:
                        {
                            _id: {'checkpoint_status':'$checkpoint_status'},
                            checkpointInfo:
                            {
                                $addToSet:
                                {
                                    _id:'$_id',
                                    checkpoint_status:'$checkpoint_status',
                                    checkpoint_name:'$checkpoint_name',
                                    created_by:'$created_by',
                                    error_class:'$error_class',
                                    error_impact:'$error_impact',
                                    // current_page:'$current_page'
                                }
                            }
                        }
                        
                        
                    },
                    {
                        $project:
                        {
                            _id:0,
                            checkpoint_status:'$_id.checkpoint_status',
                            checkpointInfo:'$checkpointInfo'
                        }
                    },
                ], function (err, result) {
                    if (err) {
                        next(err);
                    } 
                    else 
                    {
                       res.json(result);
                    }
                });
            }
        });
    });
});

router.get('/qc/rejectcheckPoint/:cpid',jwtAuth, function (req, res, next) {
    QC.Temp.remove({'_id': ObjectId(req.params.cpid)},function (err, result1) {
        QC.Temp.aggregate([
            {
                $group:
                {
                    _id: {'checkpoint_status':'$checkpoint_status'},
                    checkpointInfo:
                    {
                        $addToSet:
                        {
                            _id:'$_id',
                            checkpoint_status:'$checkpoint_status',
                            checkpoint_name:'$checkpoint_name',
                            created_by:'$created_by',
                            error_class:'$error_class',
                            error_impact:'$error_impact'
                        }
                    }
                }
                
                
            },
            {
                $project:
                {
                    _id:0,
                    checkpoint_status:'$_id.checkpoint_status',
                    checkpointInfo:'$checkpointInfo'
                }
            },
        ], function (err, result) {
            if (err) {
                next(err);
            } 
            else 
            {
               res.json(result);
            }
        });
    });
});

router.get('/qc/viewcheckpointdetail/:cpid',jwtAuth, function (req, res, next) {
    QC.Temp.findById(ObjectId(req.params.cpid),function(err, data){  

        var selectedErrorImpact=[];
        if(data.error_impact.length>0)
        {
            data.error_impact.forEach(function(item){
                selectedErrorImpact.push({
                    id:item.type_name,
                    name:item.type_name
                });
            });
        }
        
        var selectedClient=[];
        if(data.client_info.length>0)
        {
            data.client_info.forEach(function(item){
                selectedClient.push({
                    id:item.type_name,
                    name:item.type_name
                });
            });
        }

        var selectedCountry=[];
        if(data.country_info.length>0)
        {
            data.country_info.forEach(function(item){
                selectedCountry.push({
                    id:item.type_name,
                    name:item.type_name
                });
            });
        }

        var selectedState=[];
        if(data.state_info.length>0)
        {
            data.state_info.forEach(function(item){
                selectedState.push({
                    id:item.type_name,
                    name:item.type_name
                });
            });
        }

        var selectedPType=[];
        if(data.ptype_info.length>0)
        {
            data.ptype_info.forEach(function(item){
                selectedPType.push({
                    id:item.type_name,
                    name:item.type_name
                });
            });
        }
        
        var selectedPSubType=[];
        if(data.psubtype_info.length>0)
        {
            data.psubtype_info.forEach(function(item){
                selectedPSubType.push({
                    id:item.type_name,
                    name:item.type_name
                });
            });
        }

        var selectedServices=[];
        if(data.service_info.length>0)
        {
            data.service_info.forEach(function(item){
                selectedServices.push({
                    id:item.type_name,
                    name:item.type_name
                });
            });
        }

        var selectedDeliverables=[];
        if(data.deliverable_info.length>0)
        {
            data.deliverable_info.forEach(function(item){
                selectedDeliverables.push({
                    id:item.type_name,
                    name:item.type_name
                });
            });
        }

        var selectedSubDeliverables=[];
        if(data.subdeliverable_info.length>0)
        {
            data.subdeliverable_info.forEach(function(item){
                selectedSubDeliverables.push({
                    id:item.type_name,
                    name:item.type_name
                });
            });
        }

        var selectedSystems=[];
        if(data.system_info.length>0)
        {
            data.system_info.forEach(function(item){
                selectedSystems.push({
                    id:item.type_name,
                    name:item.type_name
                });
            });
        }

        var selectedItems=[];
        if(data.item_info.length>0)
        {
            data.item_info.forEach(function(item){
                selectedItems.push({
                    id:item.type_name,
                    name:item.type_name
                });
            });
        }

        var selectedMainCatg=[];
        if(data.main_category_info.length>0)
        {
            data.main_category_info.forEach(function(item){
                selectedMainCatg.push({
                    id:item.type_name,
                    name:item.type_name
                });
            });
        }

        var selectedSubCatg=[];
        if(data.sub_category_info.length>0)
        {
            data.sub_category_info.forEach(function(item){
                selectedSubCatg.push({
                    id:item.type_name,
                    name:item.type_name
                });
            });
        }

        var selectedParameter=[];
        if(data.parameter_info.length>0)
        {
            data.parameter_info.forEach(function(item){
                selectedParameter.push({
                    id:item.type_name,
                    name:item.type_name
                });
            });
        }

        var selectedCode=[];
        if(data.code_info.length>0)
        {
            data.code_info.forEach(function(item){
                selectedCode.push({
                    id:item.type_name,
                    name:item.type_name
                });
            });
        }

        res.status(201).json({
            checkpoint_name:data.checkpoint_name,
            error_class:data.error_class,
            error_impact:selectedErrorImpact,
            client_info:selectedClient,
            country_info:selectedCountry,
            state_info:selectedState,
            ptype_info:selectedPType,
            psubtype_info:selectedPSubType,
            service_info:selectedServices,
            deliverable_info:selectedDeliverables,
            subdeliverable_info:selectedSubDeliverables,
            system_info:selectedSystems,
            item_info:selectedItems,
            main_category_info:selectedMainCatg,
            sub_category_info:selectedSubCatg,
            parameter_info:selectedParameter,
            code_info:selectedCode
        });
    });
});

router.get('/qc/copycheckpoint/:cpid',jwtAuth, function (req, res, next) {
    QC.Temp.findById(ObjectId(req.params.cpid),function(err, data){  

        var selectedErrorImpact=[];
        if(data.error_impact.length>0)
        {
            data.error_impact.forEach(function(item){
                selectedErrorImpact.push({
                    '_id':new ObjectId(),
                    type_name:item.type_name
                });
            });
        }
        
        var selectedClient=[];
        if(data.client_info.length>0)
        {
            data.client_info.forEach(function(item){
                selectedClient.push({
                    '_id':new ObjectId(),
                    type_name:item.type_name
                });
            });
        }

        var selectedCountry=[];
        if(data.country_info.length>0)
        {
            data.country_info.forEach(function(item){
                selectedCountry.push({
                    '_id':new ObjectId(),
                    type_name:item.type_name
                });
            });
        }

        var selectedState=[];
        if(data.state_info.length>0)
        {
            data.state_info.forEach(function(item){
                selectedState.push({
                    '_id':new ObjectId(),
                    type_name:item.type_name
                });
            });
        }

        var selectedPType=[];
        if(data.ptype_info.length>0)
        {
            data.ptype_info.forEach(function(item){
                selectedPType.push({
                    '_id':new ObjectId(),
                    type_name:item.type_name
                });
            });
        }
        
        var selectedPSubType=[];
        if(data.psubtype_info.length>0)
        {
            data.psubtype_info.forEach(function(item){
                selectedPSubType.push({
                    '_id':new ObjectId(),
                    type_name:item.type_name
                });
            });
        }

        var selectedServices=[];
        if(data.service_info.length>0)
        {
            data.service_info.forEach(function(item){
                selectedServices.push({
                    '_id':new ObjectId(),
                    type_name:item.type_name
                });
            });
        }

        var selectedDeliverables=[];
        if(data.deliverable_info.length>0)
        {
            data.deliverable_info.forEach(function(item){
                selectedDeliverables.push({
                    '_id':new ObjectId(),
                    type_name:item.type_name
                });
            });
        }

        var selectedSubDeliverables=[];
        if(data.subdeliverable_info.length>0)
        {
            data.subdeliverable_info.forEach(function(item){
                selectedSubDeliverables.push({
                    '_id':new ObjectId(),
                    type_name:item.type_name
                });
            });
        }

        var selectedSystems=[];
        if(data.system_info.length>0)
        {
            data.system_info.forEach(function(item){
                selectedSystems.push({
                    '_id':new ObjectId(),
                    type_name:item.type_name
                });
            });
        }

        var selectedItems=[];
        if(data.item_info.length>0)
        {
            data.item_info.forEach(function(item){
                selectedItems.push({
                    '_id':new ObjectId(),
                    type_name:item.type_name
                });
            });
        }

        var selectedMainCatg=[];
        if(data.main_category_info.length>0)
        {
            data.main_category_info.forEach(function(item){
                selectedMainCatg.push({
                    '_id':new ObjectId(),
                    type_name:item.type_name
                });
            });
        }

        var selectedSubCatg=[];
        if(data.sub_category_info.length>0)
        {
            data.sub_category_info.forEach(function(item){
                selectedSubCatg.push({
                    '_id':new ObjectId(),
                    type_name:item.type_name
                });
            });
        }

        var selectedParameter=[];
        if(data.parameter_info.length>0)
        {
            data.parameter_info.forEach(function(item){
                selectedParameter.push({
                    '_id':new ObjectId(),
                    type_name:item.type_name
                });
            });
        }

        var selectedCode=[];
        if(data.code_info.length>0)
        {
            data.code_info.forEach(function(item){
                selectedCode.push({
                    '_id':new ObjectId(),
                    type_name:item.type_name
                });
            });
        }

        var selectedNotes=[];
        if(data.notes_info.length>0)
        {
            data.notes_info.forEach(function(item){

                var fileInfo=[];
                item.file_info.forEach(function(file){
                    fileInfo.push({
                        '_id':new ObjectId(),
                        file_url:file.file_url
                    });
                });

                selectedNotes.push({
                    '_id':new ObjectId(),
                    image_url:item.image_url,
                    created_by:item.created_by,
                    created_date:item.created_date,
                    notes_desc:item.notes_desc,
                    file_info:fileInfo
                });
            });
        }

        var temp=new QC.Temp({
            checkpoint_name:data.checkpoint_name,
            error_class:data.error_class,
            error_impact:selectedErrorImpact,
            client_info:selectedClient,
            country_info:selectedCountry,
            state_info:selectedState,
            ptype_info:selectedPType,
            psubtype_info:selectedPSubType,
            service_info:selectedServices,
            deliverable_info:selectedDeliverables,
            subdeliverable_info:selectedSubDeliverables,
            system_info:selectedSystems,
            item_info:selectedItems,
            main_category_info:selectedMainCatg,
            sub_category_info:selectedSubCatg,
            parameter_info:selectedParameter,
            code_info:selectedCode,
            created_by:data.created_by,
            created_date:new Date(),
            notes_info:selectedNotes
        });
        temp.save(function (err,result) {
            if (err) {
                return res.status(500).json({
                    title: 'An error occurred',
                    error: err
                });
            }
            else
            {
                QC.Temp.aggregate([
                    {
                        $group:
                        {
                            _id: {'_id':'$_id','checkpoint_name':'$checkpoint_name','created_by':'$created_by','error_class':'$error_class','error_impact':'$error_impact'}
                            
                        }
                    },
                    {
                        $project:
                        {
                            _id:'$_id._id',
                            checkpoint_name:'$_id.checkpoint_name',
                            created_by:'$_id.created_by',
                            error_class:'$_id.error_class',
                            error_impact:'$_id.error_impact'
                        }
                    },
                    { 
                        $sort : { _id : 1}
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
            }
        });
        
    });
});

router.get('/qc/removecheckpoint/:cpid',jwtAuth, function (req, res, next) {
    QC.Temp.remove({'_id': ObjectId(req.params.cpid)},function (err, result1) {
        QC.Temp.aggregate([
            {
                $group:
                {
                    _id: {'_id':'$_id','checkpoint_name':'$checkpoint_name','created_by':'$created_by','error_class':'$error_class','error_impact':'$error_impact'}
                    
                }
            },
            {
                $project:
                {
                    _id:'$_id._id',
                    checkpoint_name:'$_id.checkpoint_name',
                    created_by:'$_id.created_by',
                    error_class:'$_id.error_class',
                    error_impact:'$_id.error_impact'
                }
            },
            { 
                $sort : { _id : 1}
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
});

router.get('/qc/shownotes/:cpid',jwtAuth, function (req, res, next) {
    QC.Temp.aggregate([
        { $match:{"_id":{ $eq: ObjectId(req.params.cpid) }}},    
        { $unwind: '$notes_info' },
        {
            $group:
            {
                _id: {'_id':'$notes_info._id','notes_desc':'$notes_info.notes_desc','created_by':'$notes_info.created_by','created_date':'$notes_info.created_date','file_info':'$notes_info.file_info'}
                
            }
        },
        {
            $project:
            {
                _id:'$_id._id',
                notes_desc:'$_id.notes_desc',
                created_by:'$_id.created_by',
                created_date:'$_id.created_date',
                file_info:'$_id.file_info'
            }
        },
        { 
            $sort : { _id : 1}
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

router.post('/qc/addnotes',jwtAuth, function (req, res, next) {
    
    QC.Temp.findById(ObjectId(req.body.cpid),function(err, data){     
        data.notes_info.push({
            '_id':new ObjectId(),
            image_url:req.body.user_img,
            created_by:req.body.user_name,
            created_date:new Date(),
            notes_desc:req.body.notes_desc
        });

        data.save(function(err, result) { 
            if (err) {
                return res.status(500).json({
                    title: 'An error occurred',
                    error: err
                });
            }
            QC.Temp.aggregate([
                { $match:{"_id":{ $eq: ObjectId(req.body.cpid) }}},    
                { $unwind: '$notes_info' },
                {
                    $group:
                    {
                        _id: {'_id':'$notes_info._id','notes_desc':'$notes_info.notes_desc','created_by':'$notes_info.created_by','created_date':'$notes_info.created_date','image_url':'$notes_info.image_url','file_info':'$notes_info.file_info'}
                        
                    }
                },
                {
                    $project:
                    {
                        _id:'$_id._id',
                        notes_desc:'$_id.notes_desc',
                        created_by:'$_id.created_by',
                        created_date:'$_id.created_date',
                        image_url:'$_id.image_url',
                        file_info:'$_id.file_info'
                    }
                },
                { 
                    $sort : { _id : 1}
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
    });
});

router.get('/qc/removenotes/:cpid/:noteid',jwtAuth, function (req, res, next) {
    QC.Temp.findById(ObjectId(req.params.cpid),function(err, data){  
        data.notes_info.id(ObjectId(req.params.noteid)).remove();
        data.save(function(err, result) { 
            if (err) {
                return res.status(500).json({
                    title: 'An error occurred',
                    error: err
                });
            }
            QC.Temp.aggregate([
                { $unwind: '$notes_info' },
                {
                    $group:
                    {
                        _id: {'_id':'$notes_info._id','notes_desc':'$notes_info.notes_desc','created_by':'$notes_info.created_by','created_date':'$notes_info.created_date','file_info':'$notes_info.file_info'}
                        
                    }
                },
                {
                    $project:
                    {
                        _id:'$_id._id',
                        notes_desc:'$_id.notes_desc',
                        created_by:'$_id.created_by',
                        created_date:'$_id.created_date',
                        file_info:'$_id.file_info'
                    }
                },
                { 
                    $sort : { _id : 1}
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
    });
});

router.get('/qc/removeuploadnotes/:cpid/:noteid/:fileid',jwtAuth, function (req, res, next) {
    QC.Temp.findById(ObjectId(req.params.cpid),function(err, data){  
        data.notes_info.id(ObjectId(req.params.noteid)).file_info.id(ObjectId(req.params.fileid)).remove();
        data.save(function(err, result) { 
            if (err) {
                return res.status(500).json({
                    title: 'An error occurred',
                    error: err
                });
            }
            QC.Temp.aggregate([
                { $unwind: '$notes_info' },
                {
                    $group:
                    {
                        _id: {'_id':'$notes_info._id','notes_desc':'$notes_info.notes_desc','created_by':'$notes_info.created_by','created_date':'$notes_info.created_date','file_info':'$notes_info.file_info'}
                        
                    }
                },
                {
                    $project:
                    {
                        _id:'$_id._id',
                        notes_desc:'$_id.notes_desc',
                        created_by:'$_id.created_by',
                        created_date:'$_id.created_date',
                        file_info:'$_id.file_info'
                    }
                },
                { 
                    $sort : { _id : 1}
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
    });
});

router.get('/qc/filtercheckPoint/:bulkquery',jwtAuth,function (req, res, next) {
    var bulkquery=JSON.parse(req.params.bulkquery);
    var filterArray=[];

    var errorClass=bulkquery.filterErrors;
    var errorImpact=bulkquery.filterErrorImpact;
    var clients=bulkquery.filterClient;
    var countries=bulkquery.filterCountry;
    var states=bulkquery.filterState;
    var ptypes=bulkquery.filterPtype;
    var psubtypes=bulkquery.filterPSubtype;
    var services=bulkquery.filterService;
    var deliverables=bulkquery.filterDeliver;
    var subdeliverables=bulkquery.filterSubDeliver;
    var systems=bulkquery.filterSystem;
    var items=bulkquery.filterItem;
    var maincatgs=bulkquery.filterMainCatg;
    var subcatgs=bulkquery.filterSubCatg;
    var parameters=bulkquery.filterParam;
    var codes=bulkquery.filterCodes;
    var resources=bulkquery.filterResource;

    var selectedError=[];
    var selectedImpact=[];
    var selectedClient=[];
    var selectedCountry=[];
    var selectedState=[];
    var selectedPType=[];
    var selectedPSubType=[];
    var selectedServices=[];
    var selectedDeliverables=[];
    var selectedSubDeliverables=[];
    var selectedSystems=[];
    var selectedItems=[];
    var selectedMainCatg=[];
    var selectedSubCatg=[];
    var selectedParameter=[];
    var selectedCode=[];
    var selectedResource=[];
    
    filterArray.push({ $match:{"checkpoint_name": { $ne: '' } }})
    if(errorClass.length>0)
    {
        errorClass.forEach(function(item){
            selectedError.push(item.name);
        });
        filterArray.push({ $match:{"error_class": { $in: selectedError } }});
    }

    if(errorImpact.length>0)
    {
        errorImpact.forEach(function(item){
            selectedImpact.push(item.name);
        });
        filterArray.push({ $unwind: '$error_impact' });
        filterArray.push({ $match:{"error_impact.type_name": { $in: selectedImpact } }});
    }

    if(clients.length>0)
    {
        clients.forEach(function(item){
            selectedClient.push(item.name);
        });
        filterArray.push({ $unwind: '$client_info' });
        filterArray.push({ $match:{"client_info.type_name": { $in: selectedClient } }});
    }
    

    if(countries.length>0)
    {
        countries.forEach(function(item){
            selectedCountry.push(item.name);
        });
        filterArray.push({ $unwind: '$country_info' });
        filterArray.push({ $match:{"country_info.type_name": { $in: selectedCountry } }});
    }

    if(states.length>0)
    {
        states.forEach(function(item){
            selectedState.push(item.name);
        });
        filterArray.push({ $unwind: '$state_info' });
        filterArray.push({ $match:{"state_info.type_name": { $in: selectedState } }});
    }

    if(ptypes.length>0)
    {
        ptypes.forEach(function(item){
            selectedPType.push(item.name);
        });
        filterArray.push({ $unwind: '$ptype_info' });
        filterArray.push({ $match:{"ptype_info.type_name": { $in: selectedPType } }});
    }

    if(psubtypes.length>0)
    {
        psubtypes.forEach(function(item){
            selectedPSubType.push(item.name);
        });
        filterArray.push({ $unwind: '$psubtype_info' });
        filterArray.push({ $match:{"psubtype_info.type_name": { $in: selectedPSubType } }});
    }

    if(services.length>0)
    {
        services.forEach(function(item){
            selectedServices.push(item.name);
        });
        filterArray.push({ $unwind: '$service_info' });
        filterArray.push({ $match:{"service_info.type_name": { $in: selectedServices } }});
    }

    if(deliverables.length>0)
    {
        deliverables.forEach(function(item){
            selectedDeliverables.push(item.name);
        });
        filterArray.push({ $unwind: '$deliverable_info' });
        filterArray.push({ $match:{"deliverable_info.type_name": { $in: selectedDeliverables } }});
    }
    
    if(subdeliverables.length>0)
    {
        subdeliverables.forEach(function(item){
            selectedSubDeliverables.push(item.name);
        });
        filterArray.push({ $unwind: '$subdeliverable_info' });
        filterArray.push({ $match:{"subdeliverable_info.type_name": { $in: selectedSubDeliverables } }});
    }

    if(systems.length>0)
    {
        systems.forEach(function(item){
            selectedSystems.push(item.name);
        });
        filterArray.push({ $unwind: '$system_info' });
        filterArray.push({ $match:{"system_info.type_name": { $in: selectedSystems } }});
    }
    
    if(items.length>0)
    {
        items.forEach(function(item){
            selectedItems.push(item.name);
        });
        filterArray.push({ $unwind: '$item_info' });
        filterArray.push({ $match:{"item_info.type_name": { $in: selectedItems } }});
    }

    if(maincatgs.length>0)
    {
        maincatgs.forEach(function(item){
            selectedMainCatg.push(item.name);
        });
        filterArray.push({ $unwind: '$main_category_info' });
        filterArray.push({ $match:{"main_category_info.type_name": { $in: selectedMainCatg } }});
    }

    if(subcatgs.length>0)
    {
        subcatgs.forEach(function(item){
            selectedSubCatg.push(item.name);
        });
        filterArray.push({ $unwind: '$sub_category_info' });
        filterArray.push({ $match:{"sub_category_info.type_name": { $in: selectedSubCatg } }});
    }
    
    if(parameters.length>0)
    {
        parameters.forEach(function(item){
            selectedParameter.push(item.name);
        });
        filterArray.push({ $unwind: '$parameter_info' });
        filterArray.push({ $match:{"parameter_info.type_name": { $in: selectedParameter } }});
    }

    if(codes.length>0)
    {
        codes.forEach(function(item){
            selectedCode.push(item.name);
        });
        filterArray.push({ $unwind: '$code_info' });
        filterArray.push({ $match:{"code_info.type_name": { $in: selectedCode } }});
    }

    if(resources.length>0)
    {
        resources.forEach(function(item){
            selectedResource.push(item.name);
        });
        filterArray.push({ $match:{"created_by": { $in: selectedResource } }});
    } 

    filterArray.push({
        $group:
        {
            _id: {'_id':'$_id','checkpoint_name':'$checkpoint_name','created_by':'$created_by','error_class':'$error_class','error_impact':'$error_impact'}
        }
    },
    {
        $project:
        {
            _id:'$_id._id',
            checkpoint_name:'$_id.checkpoint_name',
            created_by:'$_id.created_by',
            error_class:'$_id.error_class',
            error_impact:'$_id.error_impact'
        }
    },
    {
        $sort : { _id : 1 }
    });
    QC.Temp.aggregate(filterArray, function (err, result) {
        if (err) {
            next(err);
        } 
        else 
        {
           res.json(result)
        }
    });
});


router.post("/uploadnotes/:cpid/:nid", function(req, res) {
    var multer = require('multer');
    var fs= require('fs');
    var img_url="";
    var img_type='';
    //var currentdate=new Date();
    var imgicon = multer.diskStorage({
        destination: function(req, file, callback) {
            if (!fs.existsSync('public/notes/'+req.params.nid))
            {
                fs.mkdirSync('public/notes/'+req.params.nid);   
            }
            else
            {
                var testFolder = 'public/notes/'+req.params.nid;
                fs.readdirSync(testFolder).forEach(file => {
                    fs.unlinkSync(testFolder+'/'+file);
                })
            }
            callback(null,'public/notes/'+req.params.nid);
        },
        filename: function(req, file, callback) {
            callback(null, file.originalname);
            img_url='/notes/'+req.params.nid+'/'+file.originalname;
            img_type=file.originalname.split('.').pop();
        }
    });
 
    var itemupload = multer({ storage: imgicon }).single('uploads');
    itemupload(req, res, function(err) {
        if (err) {
            return res.send({ status: 'Error uploading file' });
        }
        else
        {
            QC.Temp.findById(ObjectId(req.params.cpid),function(err, data){  
                data.notes_info.id(ObjectId(req.params.nid)).file_info.push({
                    '_id':new ObjectId(),
                    file_url:img_url,
                    file_type:img_type
                });
                data.save(function(err, result) { 
                    if (err) {
                        return res.status(500).json({
                            title: 'An error occurred',
                            error: err
                        });
                    }
                    else
                    {
                        QC.Temp.aggregate([
                            { $unwind: '$notes_info' },
                            {
                                $group:
                                {
                                    _id: {'_id':'$notes_info._id','notes_desc':'$notes_info.notes_desc','created_by':'$notes_info.created_by','created_date':'$notes_info.created_date','file_info':'$notes_info.file_info'}
                                    
                                }
                            },
                            {
                                $project:
                                {
                                    _id:'$_id._id',
                                    notes_desc:'$_id.notes_desc',
                                    created_by:'$_id.created_by',
                                    created_date:'$_id.created_date',
                                    file_info:'$_id.file_info'
                                }
                            },
                            { 
                                $sort : { _id : 1}
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
                    }
                });
            });
        }
    });
});

router.get('/qc/changetempcountry/:countries',jwtAuth, function (req, res, next) {
    var countries=[];
    var bulkquery=JSON.parse(req.params.countries);
    bulkquery.forEach(function(item){
        countries.push(item.name);
    });
    Thogupu.Country.aggregate([
        { $match:{"country_name": { $in: countries } }},  
        { $unwind: '$state_info' },
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
                id:'$_id.state_name',
                name:'$_id.state_name'
            }
        },
        { 
            $sort : { name : 1}
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


router.get('/qc/changetempprojecttype/:ptypes',jwtAuth, function (req, res, next) {
    var ptypes=[];
    var bulkquery=JSON.parse(req.params.ptypes);
    bulkquery.forEach(function(item){
        ptypes.push(item.name);
    });
    Thogupu.PType.aggregate([
        { $match:{"project_type": { $in: ptypes } }},  
        { $unwind: '$subtype_info' },
        {
            $group:
            {
                _id: {'_id':'$subtype_info.project_subtype'}
                
            }
        },
        {
            $project:
            {
                _id:'$_id._id',
                id:'$_id._id',
                name:'$_id._id'
            }
        },
        { 
            $sort : { _id : 1}
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


router.get('/qc/changetempservice/:services',jwtAuth, function (req, res, next) {
    var services=[];

    var bulkquery=JSON.parse(req.params.services);
    bulkquery.forEach(function(item){
        services.push(item.name);
    });

    Thogupu.Service.aggregate([
        { $match:{"service_name": { $in: services } }},  
        { $unwind: '$deliverable_info' },
        {
            $group:
            {
                _id: {'_id':'$deliverable_info._id','deliverable_name':'$deliverable_info.deliverable_name'}
                
            }
        },
        {
            $project:
            {
                _id:'$_id._id',
                id:'$_id.deliverable_name',
                name:'$_id.deliverable_name'
            }
        },
        { 
            $sort : { _id : 1}
        }
    ], function (err, result1) {
        if (err) {
            next(err);
        } 
        else 
        {
            Thogupu.Service.aggregate([
                { $match:{"service_name": { $in: services } }},   
                { $unwind: '$system_info' },
                {
                    $group:
                    {
                        _id: {'_id':'$system_info._id','system_name':'$system_info.system_name'}
                        
                    }
                },
                {
                    $project:
                    {
                        _id:'$_id._id',
                        id:'$_id.system_name',
                        name:'$_id.system_name'
                    }
                },
                { 
                    $sort : { _id : 1}
                }
            ], function (err, result2) {
                if (err) {
                    next(err);
                } 
                else 
                {
                    Thogupu.Service.aggregate([
                        { $match:{"service_name":{ $in: services }}},  
                        { $unwind: '$code_info' },
                        {
                            $group:
                            {
                                _id: {'_id':'$code_info._id','code_name':'$code_info.code_name'}
                                
                            }
                        },
                        {
                            $project:
                            {
                                _id:'$_id._id',
                                id:'$_id.code_name',
                                name:'$_id.code_name'
                            }
                        },
                        { 
                            $sort : { _id : 1}
                        }
                    ], function (err, result3) {
                        if (err) {
                            next(err);
                        } 
                        else 
                        {
                            res.status(201).json({
                                msg: 'save',
                                delCatgList:result1,
                                systemList:result2,
                                codeList:result3
                            }); 
                        }
                    });
                }
            });
        }
    });
});

router.get('/qc/changetempdeliverables/:services/:deliverables',jwtAuth, function (req, res, next) {
    
    var services=[];
    var deliverables=[];
    var bulkquery1=JSON.parse(req.params.services);
    bulkquery1.forEach(function(item){
        services.push(item.name);
    });

    var bulkquery2=JSON.parse(req.params.deliverables);
    bulkquery2.forEach(function(item){
        deliverables.push(item.name);
    });
   
    Thogupu.Service.aggregate([
        { $match:{"service_name": { $in: services } }},  
        { $unwind: '$deliverable_info' },
        { $match:{"deliverable_info.deliverable_name": { $in: deliverables } }},  
        { $unwind: '$deliverable_info.sub_deliverable_info' },
        {
            $group:
            {
                _id: {'_id':'$deliverable_info.sub_deliverable_info._id','sub_deliverable_name':'$deliverable_info.sub_deliverable_info.sub_deliverable_name'}
                
            }
        },
        {
            $project:
            {
                _id:'$_id._id',
                id:'$_id.sub_deliverable_name',
                name:'$_id.sub_deliverable_name'
            }
        },
        { 
            $sort : { _id : 1}
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

router.get('/qc/changetempsystems/:services/:systems',jwtAuth, function (req, res, next) {
    
    var services=[];
    var systems=[];

    var bulkquery1=JSON.parse(req.params.services);
    bulkquery1.forEach(function(item){
        services.push(item.name);
    });

    var bulkquery2=JSON.parse(req.params.systems);
    bulkquery2.forEach(function(item){
        systems.push(item.name);
    });

    Thogupu.Service.aggregate([
        { $match:{"service_name": { $in: services } }},  
        { $unwind: '$system_info' },
        { $match:{"system_info.system_name": { $in: systems } }},  
        { $unwind: '$system_info.item_info' },
        {
            $group:
            {
                _id: {'_id':'$system_info.item_info._id','item_name':'$system_info.item_info.item_name'}
                
            }
        },
        {
            $project:
            {
                _id:'$_id._id',
                id:'$_id.item_name',
                name:'$_id.item_name'
            }
        },
        { 
            $sort : { _id : 1}
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

router.get('/qc/changetempitems/:services/:systems/:items',jwtAuth, function (req, res, next) {
    var services=[];
    var systems=[];
    var items=[];

    var bulkquery1=JSON.parse(req.params.services);
    bulkquery1.forEach(function(item){
        services.push(item.name);
    });

    var bulkquery2=JSON.parse(req.params.systems);
    bulkquery2.forEach(function(item){
        systems.push(item.name);
    });

    var bulkquery3=JSON.parse(req.params.items);
    bulkquery3.forEach(function(item){
        items.push(item.name);
    });

    Thogupu.Service.aggregate([
        { $match:{"service_name": { $in: services } }},  
        { $unwind: '$system_info' },
        { $match:{"system_info.system_name": { $in: systems } }},  
        { $unwind: '$system_info.item_info' },
        { $match:{"system_info.item_info.item_name": { $in: items } }},  
        { $unwind: '$system_info.item_info.main_category_info' },
        {
            $group:
            {
                _id: {'_id':'$system_info.item_info.main_category_info._id','main_category_name':'$system_info.item_info.main_category_info.main_category_name'}
                
            }
        },
        {
            $project:
            {
                _id:'$_id._id',
                id:'$_id.main_category_name',
                name:'$_id.main_category_name'
            }
        },
        { 
            $sort : { _id : 1}
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

router.get('/qc/changetempmaincatg/:services/:systems/:items/:mcatgories',jwtAuth, function (req, res, next) {
    
    var services=[];
    var systems=[];
    var items=[];
    var mcatgories=[];

    var bulkquery1=JSON.parse(req.params.services);
    bulkquery1.forEach(function(item){
        services.push(item.name);
    });

    var bulkquery2=JSON.parse(req.params.systems);
    bulkquery2.forEach(function(item){
        systems.push(item.name);
    });

    var bulkquery3=JSON.parse(req.params.items);
    bulkquery3.forEach(function(item){
        items.push(item.name);
    });

    var bulkquery4=JSON.parse(req.params.mcatgories);
    bulkquery4.forEach(function(item){
        mcatgories.push(item.name);
    });

    Thogupu.Service.aggregate([
        { $match:{"service_name": { $in: services } }},  
        { $unwind: '$system_info' },
        { $match:{"system_info.system_name": { $in: systems } }},  
        { $unwind: '$system_info.item_info' },
        { $match:{"system_info.item_info.item_name": { $in: items } }},  
        { $unwind: '$system_info.item_info.main_category_info' },
        { $match:{"system_info.item_info.main_category_info.main_category_name": { $in: mcatgories } }},  
        { $unwind: '$system_info.item_info.main_category_info.sub_category_info' },
        {
            $group:
            {
                _id: {'_id':'$system_info.item_info.main_category_info.sub_category_info._id','sub_category_name':'$system_info.item_info.main_category_info.sub_category_info.sub_category_name'}
                
            }
        },
        {
            $project:
            {
                _id:'$_id._id',
                id:'$_id.sub_category_name',
                name:'$_id.sub_category_name'
            }
        },
        { 
            $sort : { _id : 1}
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

router.get('/qc/changetempsubcatg/:services/:systems/:items/:mcatgories/:scatgories',jwtAuth, function (req, res, next) {

    var services=[];
    var systems=[];
    var items=[];
    var mcatgories=[];
    var scatgories=[];

    var bulkquery1=JSON.parse(req.params.services);
    bulkquery1.forEach(function(item){
        services.push(item.name);
    });

    var bulkquery2=JSON.parse(req.params.systems);
    bulkquery2.forEach(function(item){
        systems.push(item.name);
    });

    var bulkquery3=JSON.parse(req.params.items);
    bulkquery3.forEach(function(item){
        items.push(item.name);
    });

    var bulkquery4=JSON.parse(req.params.mcatgories);
    bulkquery4.forEach(function(item){
        mcatgories.push(item.name);
    });

    var bulkquery5=JSON.parse(req.params.scatgories);
    bulkquery5.forEach(function(item){
        scatgories.push(item.name);
    });

    Thogupu.Service.aggregate([
        { $match:{"service_name": { $in: services } }},  
        { $unwind: '$system_info' },
        { $match:{"system_info.system_name": { $in: systems } }},  
        { $unwind: '$system_info.item_info' },
        { $match:{"system_info.item_info.item_name": { $in: items } }},  
        { $unwind: '$system_info.item_info.main_category_info' },
        { $match:{"system_info.item_info.main_category_info.main_category_name": { $in: mcatgories } }},  
        { $unwind: '$system_info.item_info.main_category_info.sub_category_info' },
        { $match:{"system_info.item_info.main_category_info.sub_category_info.sub_category_name": { $in: scatgories } }},  
        { $unwind: '$system_info.item_info.main_category_info.sub_category_info.parameter_info' },
        {
            $group:
            {
                _id: {'_id':'$system_info.item_info.main_category_info.sub_category_info.parameter_info._id','parameter_name':'$system_info.item_info.main_category_info.sub_category_info.parameter_info.parameter_name'}
                
            }
        },
        {
            $project:
            {
                _id:'$_id._id',
                id:'$_id.parameter_name',
                name:'$_id.parameter_name'
            }
        },
        { 
            $sort : { _id : 1}
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

router.get('/qc/addcountry/:cname',jwtAuth, function (req, res, next) {
    var country = new Thogupu.Country({
        '_id':new ObjectId(),
        country_name:req.params.cname
    });
    country.save(function (err,result1) {
        if (err) {
            return res.status(500).json({
                title: 'An error occurred',
                error: err
            });
        }
        else
        {
            Thogupu.Country.aggregate([
                {
                    $group: {
                        _id:{'_id':'$_id','country_name':'$country_name'}
                    }
                },
                {
                    $project:
                    {
                        _id:0,
                        id:'$_id._id',
                        name:'$_id.country_name'
                    }
                },  
                {
                    $sort:
                    {
                        'id' :-1
                    }
                }
            ], function (err, result) {
                if (err) {
                    next(err);
                } 
                else 
                {
                    res.json(result);
                }
            });
        }
    });
});

router.get('/qc/addstate/:cname/:sname/:countries',jwtAuth, function (req, res, next) {
    var bulkquery=JSON.parse(req.params.countries);
    var countries=[];
    bulkquery.forEach(function(item){
        countries.push(item.name);
    });
    
    Thogupu.Country.findOne({country_name:req.params.cname},function(err, data1){ 
        var t=data1.state_info;
        var index = t.findIndex(x => x.state_name==req.params.sname);
        if (index>=0)
        {
            res.status(201).json({
                msg:'exist'
            }); 
        }
        else
        {
            var subDocument={
                "_id":new ObjectId(),
                state_name:req.params.sname
            };
            t.push(subDocument);
            data1.save(function(err, result) { 
                if (err) {
                    return res.status(500).json({
                        title: 'An error occurred',
                        error: err
                    });
                }
                Thogupu.Country.aggregate([
                    { $match:{"country_name":{ $in: countries }}},  
                    { $unwind: '$state_info' },
                    {
                        $group: {
                            _id:{"_id":"$_id",'state_id':'$state_info._id','state_name':'$state_info.state_name'}
                        }
                    },
                    {
                        $project:
                        {
                            _id:'$_id.state_id',
                            id:'$_id.state_name',
                            name:'$_id.state_name'
                        }
                    },  
                    {
                        $sort:
                        {
                            '_id' :1
                        }
                    }
                ], function (err, result) {
                    if (err) {
                        next(err);
                    } else {
                        
                        res.status(201).json({
                            result: result,
                            msg:'saved'
                        }); 
                    }
                });
            });
        }
    }); 
});

router.get('/qc/tempaddclient/:cname',jwtAuth, function (req, res, next) {
    var client = new QC.Client({
        '_id':new ObjectId(),
        client_name:req.params.cname
    });
    client.save(function (err,result1) {
        if (err) {
            return res.status(500).json({
                title: 'An error occurred',
                error: err
            });
        }
        else
        {
            QC.Client.aggregate([
                {
                    $group: {
                        _id:{'_id':'$_id','client_name':'$client_name'}
                    }
                },
                {
                    $project:
                    {
                        _id:0,
                        id:'$_id._id',
                        name:'$_id.client_name'
                    }
                },  
                {
                    $sort:
                    {
                        'id' :-1
                    }
                }
            ], function (err, result) {
                if (err) {
                    next(err);
                } 
                else 
                {
                    res.json(result);
                }
            });
        }
    });
});

router.get('/qc/addprojecttype/:ptype',jwtAuth, function (req, res, next) {
    Thogupu.PType.findOne({project_type:req.params.ptype},function(err, data1){ 
        if (data1==null)
        {
            var ptype = new Thogupu.PType({
                '_id':new ObjectId(),
                project_type:req.params.ptype
            });
            ptype.save(function (err,result1) {
                if (err) {
                    return res.status(500).json({
                        title: 'An error occurred',
                        error: err
                    });
                }
                else
                {
                    Thogupu.PType.aggregate([
                        {
                            $group: {
                                _id:{'_id':'$_id','project_type':'$project_type'}
                            }
                        },
                        {
                            $project:
                            {
                                _id:0,
                                id:'$_id._id',
                                name:'$_id.project_type'
                            }
                        },  
                        {
                            $sort:
                            {
                                'id' :-1
                            }
                        }
                    ], function (err, result) {
                        if (err) {
                            next(err);
                        } 
                        else 
                        {
                            res.status(201).json({
                                msg:'save',
                                result:result
                            }); 
                        }
                    });
                }
            });
        }
        else
        {
            res.status(201).json({
                msg:'exist'
            }); 
        }
    });
});

router.get('/qc/addprojectsubtype/:ptype/:pstype/:ptypes',jwtAuth, function (req, res, next) {
    var bulkquery=JSON.parse(req.params.ptypes);
    var ptypes=[];
    bulkquery.forEach(function(item){
        ptypes.push(item.name);
    });

    Thogupu.PType.findOne({project_type:req.params.ptype},function(err, data){ 
        var t=data.sub_type_info;
        var index = t.findIndex(x => x.project_sub_type==req.params.pstype);
        if (index>=0)
        {
            res.status(201).json({
                msg:'exist'
            }); 
        }
        else
        {
            var subDocument={
                "_id":new ObjectId(),
                project_sub_type:req.params.pstype
            }
            t.push(subDocument);
            data.save(function(err, result) { 
                if (err) {
                    return res.status(500).json({
                        title: 'An error occurred',
                        error: err
                    });
                }
                Thogupu.PType.aggregate([
                    { $match:{"project_type":{ $in: ptypes }}},  
                    { $unwind: '$sub_type_info' },
                    {
                        $group: {
                            _id:{'_id':'$sub_type_info.project_sub_type'}
                        }
                    },
                    {
                        $project:
                        {
                            _id:'$_id._id',
                            id:'$_id._id',
                            name:'$_id._id'
                        }
                    },  
                    {
                        $sort:
                        {
                            '_id' :1
                        }
                    }
                ], function (err, result2) {
                    if (err) {
                        next(err);
                    } 
                    else 
                    {
                        res.status(201).json({
                            result: result2,
                            msg:'saved'
                        }); 
                    }
                });
            });
        }
    });
});

router.get('/qc/adderrorimpact/:errimp',jwtAuth, function (req, res, next) {
    var error = new QC.Error({
        '_id':new ObjectId(),
        error_impact:req.params.errimp
    });
    error.save(function (err,result1) {
        if (err) {
            return res.status(500).json({
                title: 'An error occurred',
                error: err
            });
        }
        else
        {
            QC.Error.aggregate([
                {
                    $group: {
                        _id:{'_id':'$_id','error_impact':'$error_impact'}
                    }
                },
                {
                    $project:
                    {
                        _id:0,
                        id:'$_id._id',
                        name:'$_id.error_impact'
                    }
                },  
                {
                    $sort:
                    {
                        'id' :-1
                    }
                }
            ], function (err, result) {
                if (err) {
                    next(err);
                } 
                else 
                {
                    res.json(result);
                }
            });
        }
    });
});

router.get('/qc/tempaddservice/:sname',jwtAuth, function (req, res, next) {
    Thogupu.Service.findOne({service_name:req.params.sname},function(err, data1){ 
        if (data1==null)
        {
            var service = new Thogupu.Service({
                '_id':new ObjectId(),
                service_name:req.params.sname
            });
            service.save(function (err,result1) {
                if (err) {
                    return res.status(500).json({
                        title: 'An error occurred',
                        error: err
                    });
                }
                else
                {
                    Thogupu.Service.aggregate([
                        {
                            $group: {
                                _id:{'_id':'$_id','service_name':'$service_name'}
                            }
                        },
                        {
                            $project:
                            {
                                _id:0,
                                id:'$_id._id',
                                name:'$_id.service_name'
                            }
                        },  
                        {
                            $sort:
                            {
                                'id' :-1
                            }
                        }
                    ], function (err, result) {
                        if (err) {
                            next(err);
                        } 
                        else 
                        {
                            res.status(201).json({
                                msg:'save',
                                result:result
                            }); 
                        }
                    });
                }
            });
        }
        else
        {
            res.status(201).json({
                msg:'exist'
            }); 
        }
    });
});

router.get('/qc/gettempdeliverables/:sname',jwtAuth, function (req, res, next) {
    Thogupu.Service.aggregate([
        { $match:{"service_name": req.params.sname }},  
        { $unwind: '$deliverable_info' },
        {
            $group:
            {
                _id: {'_id':'$deliverable_info.deliverable_name'}
                
            }
        },
        {
            $project:
            {
                _id:'$_id._id',
                id:'$_id._id',
                name:'$_id._id'
            }
        },
        { 
            $sort : { _id : 1}
        }
    ], function (err, result) {
        if (err) {
            next(err);
        } 
        else 
        {
            res.json(result);
        }
    });
});

router.get('/qc/gettempsystem/:sname',jwtAuth, function (req, res, next) {
    Thogupu.Service.aggregate([
        { $match:{"service_name": req.params.sname }},  
        { $unwind: '$system_info' },
        {
            $group:
            {
                _id: {'_id':'$system_info.system_name'}
                
            }
        },
        {
            $project:
            {
                _id:'$_id._id',
                id:'$_id._id',
                name:'$_id._id'
            }
        },
        { 
            $sort : { _id : 1}
        }
    ], function (err, result) {
        if (err) {
            next(err);
        } 
        else 
        {
            res.json(result);
        }
    });
});

router.get('/qc/gettempitem/:sname/:sysname',jwtAuth, function (req, res, next) {
    Thogupu.Service.aggregate([
        { $match:{"service_name": req.params.sname }},  
        { $unwind: '$system_info' },
        { $match:{"system_info.system_name": req.params.sysname }},  
        { $unwind: '$system_info.item_info' },
        {
            $group:
            {
                _id: {'_id':'$system_info.item_info.item_name'}
                
            }
        },
        {
            $project:
            {
                _id:'$_id._id',
                id:'$_id._id',
                name:'$_id._id'
            }
        },
        { 
            $sort : { _id : 1}
        }
    ], function (err, result) {
        if (err) {
            next(err);
        } 
        else 
        {
            res.json(result);
        }
    });
});

router.get('/qc/gettempmaincatg/:sname/:sysname/:itemname',jwtAuth, function (req, res, next) {
    Thogupu.Service.aggregate([
        { $match:{"service_name": req.params.sname }},  
        { $unwind: '$system_info' },
        { $match:{"system_info.system_name": req.params.sysname }},  
        { $unwind: '$system_info.item_info' },
        { $match:{"system_info.item_info.item_name": req.params.itemname }},
        { $unwind: '$system_info.item_info.main_category_info' },
        {
            $group:
            {
                _id: {'_id':'$system_info.item_info.main_category_info.main_category_name'}
                
            }
        },
        {
            $project:
            {
                _id:'$_id._id',
                id:'$_id._id',
                name:'$_id._id'
            }
        },
        { 
            $sort : { _id : 1}
        }
    ], function (err, result) {
        if (err) {
            next(err);
        } 
        else 
        {
            res.json(result);
        }
    });
});

router.get('/qc/gettempsubcatg/:sname/:sysname/:itemname/:maincatg',jwtAuth, function (req, res, next) {
    Thogupu.Service.aggregate([
        { $match:{"service_name": req.params.sname }},  
        { $unwind: '$system_info' },
        { $match:{"system_info.system_name": req.params.sysname }},  
        { $unwind: '$system_info.item_info' },
        { $match:{"system_info.item_info.item_name": req.params.itemname }},
        { $unwind: '$system_info.item_info.main_category_info' },
        { $match:{"system_info.item_info.main_category_info.main_category_name": req.params.maincatg }},
        { $unwind: '$system_info.item_info.main_category_info.sub_category_info' },
        {
            $group:
            {
                _id: {'_id':'$system_info.item_info.main_category_info.sub_category_info.sub_category_name'}
                
            }
        },
        {
            $project:
            {
                _id:'$_id._id',
                id:'$_id._id',
                name:'$_id._id'
            }
        },
        { 
            $sort : { _id : 1}
        }
    ], function (err, result) {
        if (err) {
            next(err);
        } 
        else 
        {
            res.json(result);
        }
    });
});

router.get('/qc/gettempcode/:sname',jwtAuth, function (req, res, next) {
    Thogupu.Service.aggregate([
        { $match:{"service_name": req.params.sname }},  
        { $unwind: '$code_info' },
        {
            $group:
            {
                _id: {'_id':'$code_info.code_name'}
                
            }
        },
        {
            $project:
            {
                _id:'$_id._id',
                id:'$_id._id',
                name:'$_id._id'
            }
        },
        { 
            $sort : { _id : 1}
        }
    ], function (err, result) {
        if (err) {
            next(err);
        } 
        else 
        {
            res.json(result);
        }
    });
});

router.get('/qc/tempadddelcategory/:sname/:dname/:services',jwtAuth, function (req, res, next) {
    var bulkquery=JSON.parse(req.params.services);
    var services=[];
    bulkquery.forEach(function(item){
        services.push(item.name);
    });

    Thogupu.Service.findOne({service_name:req.params.sname},function(err, data){ 
        var index = data.deliverable_info.findIndex(x => x.deliverable_name==req.params.dname);
        if(index>=0)
        {
            res.status(201).json({
                msg: 'exist'
            }); 
        }
        else
        {
            data.deliverable_info.push({
                '_id':new ObjectId(),
                deliverable_name:req.params.dname,
                sub_deliverable_info:[]
            });
            data.save(function(err, result) { 
                if (err) {
                    return res.status(500).json({
                        title: 'An error occurred',
                        error: err
                    });
                }
                else
                {
                    Thogupu.Service.aggregate([
                        { $match:{"service_name":{ $in: services }}},  
                        { $unwind: '$deliverable_info' },
                        {
                            $group:
                            {
                                _id: {'_id':'$deliverable_info.deliverable_name'}
                                
                            }
                        },
                        {
                            $project:
                            {
                                _id:'$_id._id',
                                id:'$_id._id',
                                name:'$_id._id'
                            }
                        },
                        { 
                            $sort : { _id : 1}
                        }
                    ], function (err, result) {
                        if (err) {
                            next(err);
                        } 
                        else 
                        {
                            res.status(201).json({
                                msg: 'save',
                                delCatgList:result
                            }); 
                        }
                    });
                }
            });
        }
    });
});

router.get('/qc/tempadddelsubcategory/:sname/:dname/:sdame/:services/:deliverables',jwtAuth, function (req, res, next) {
    Thogupu.Service.findOne({service_name:req.params.sname},function(err, data){ 
        var services=[];
        var deliverables=[];

        var bulkquery1=JSON.parse(req.params.services);
        var bulkquery2=JSON.parse(req.params.deliverables);

        bulkquery1.forEach(function(item){
            services.push(item.name);
        });
        bulkquery2.forEach(function(item){
            deliverables.push(item.name);
        });

        var delIndex=data.deliverable_info.findIndex(x => x.deliverable_name==req.params.dname);
        var t=data.deliverable_info[delIndex].sub_deliverable_info
        var index=t.findIndex(x => x.sub_deliverable_name==req.params.sdame);

        if(index>=0)
        {
            res.status(201).json({
                msg: 'exist'
            }); 
        }
        else
        {
            t.push({
                '_id':new ObjectId(),
                sub_deliverable_name:req.params.sdame
            });
            data.save(function(err, result) { 
                if (err) {
                    return res.status(500).json({
                        title: 'An error occurred',
                        error: err
                    });
                }
                else
                {
                    Thogupu.Service.aggregate([
                        { $match:{"service_name":{ $in: services }}},  
                        { $unwind: '$deliverable_info' },
                        { $match:{"deliverable_info.deliverable_name":{ $in: deliverables }}},  
                        { $unwind: '$deliverable_info.sub_deliverable_info' },
                        {
                            $group:
                            {
                                _id: {'_id':'$deliverable_info.sub_deliverable_info.sub_deliverable_name'}
                            }
                        },
                        {
                            $project:
                            {
                                _id:'$_id._id',
                                id:'$_id._id',
                                name:'$_id._id'
                            }
                        },
                        { 
                            $sort : { _id : 1}
                        }
                    ], function (err, result) {
                        if (err) {
                            next(err);
                        } 
                        else 
                        {
                            res.status(201).json({
                                msg: 'save',
                                delSubCatgList:result
                            }); 
                        }
                    });
                }
            });
        }
    });
});

router.get('/qc/tempaddsystem/:sname/:sysname/:services',jwtAuth, function (req, res, next) {
    var services=[];
    var bulkquery=JSON.parse(req.params.services);
    bulkquery.forEach(function(item){
        services.push(item.name);
    });
    Thogupu.Service.findOne({service_name:req.params.sname},function(err, data){ 
        var index = data.system_info.findIndex(x => x.system_name==req.params.sysname);
        if(index>=0)
        {
            res.status(201).json({
                msg: 'exist'
            }); 
        }
        else
        {
            data.system_info.push({
                '_id':new ObjectId(),
                system_name:req.params.sysname
            });
            data.save(function(err, result) { 
                if (err) {
                    return res.status(500).json({
                        title: 'An error occurred',
                        error: err
                    });
                }
                else
                {
                    Thogupu.Service.aggregate([
                        { $match:{"service_name":{ $in: services }}},  
                        { $unwind: '$system_info' },
                        {
                            $group:
                            {
                                _id: {'_id':'$system_info.system_name'}
                                
                            }
                        },
                        {
                            $project:
                            {
                                _id:'$_id._id',
                                id:'$_id._id',
                                name:'$_id._id'
                            }
                        },
                        { 
                            $sort : { _id : 1}
                        }
                    ], function (err, result) {
                        if (err) {
                            next(err);
                        } 
                        else 
                        {
                            res.status(201).json({
                                msg: 'save',
                                systemList:result
                            }); 
                        }
                    });
                }
            });
        }
    });
});

router.get('/qc/tempadditem/:sname/:sysname/:itemname/:services/:systems',jwtAuth, function (req, res, next) {
    var services=[];
    var systems=[];
    var bulkquery=JSON.parse(req.params.services);
    bulkquery.forEach(function(item){
        services.push(item.name);
    });
    var bulkquery2=JSON.parse(req.params.systems);
    bulkquery2.forEach(function(item){
        systems.push(item.name);
    });


    Thogupu.Service.findOne({service_name:req.params.sname},function(err, data){ 
        var sysindex = data.system_info.findIndex(x => x.system_name==req.params.sysname);
        var itemindex = data.system_info[sysindex].item_info.findIndex(x => x.item_name==req.params.itemname);
        if(itemindex>=0)
        {
            res.status(201).json({
                msg: 'exist'
            }); 
        }
        else
        {
            data.system_info[sysindex].item_info.push({
                '_id':new ObjectId(),
                item_name:req.params.itemname
            });
            data.save(function(err, result) { 
                if (err) {
                    return res.status(500).json({
                        title: 'An error occurred',
                        error: err
                    });
                }
                else
                {
                    Thogupu.Service.aggregate([
                        { $match:{"service_name":{ $in: services }}},  
                        { $unwind: '$system_info' },
                        { $match:{"system_info.system_name":{ $in: systems }}},  
                        { $unwind: '$system_info.item_info' },
                        {
                            $group:
                            {
                                _id: {'_id':'$system_info.item_info.item_name'}
                                
                            }
                        },
                        {
                            $project:
                            {
                                _id:'$_id._id',
                                id:'$_id._id',
                                name:'$_id._id'
                            }
                        },
                        { 
                            $sort : { _id : 1}
                        }
                    ], function (err, result) {
                        if (err) {
                            next(err);
                        } 
                        else 
                        {
                            res.status(201).json({
                                msg: 'save',
                                itemList:result
                            }); 
                        }
                    });
                }
            });
        }
    });
});

router.get('/qc/tempaddmaincatg/:sname/:sysname/:itemname/:mainname/:services/:systems/:items',jwtAuth, function (req, res, next) {
    var services=JSON.parse(req.params.services);
    var systems=JSON.parse(req.params.systems);
    var items=JSON.parse(req.params.items);

    var services=[];
    var systems=[];
    var items=[];

    var bulkquery=JSON.parse(req.params.services);
    bulkquery.forEach(function(item){
        services.push(item.name);
    });
    var bulkquery2=JSON.parse(req.params.systems);
    bulkquery2.forEach(function(item){
        systems.push(item.name);
    });
    var bulkquery3=JSON.parse(req.params.items);
    bulkquery3.forEach(function(item){
        items.push(item.name);
    });

    Thogupu.Service.findOne({service_name:req.params.sname},function(err, data){ 
        var sysindex = data.system_info.findIndex(x => x.system_name==req.params.sysname);
        var itemindex = data.system_info[sysindex].item_info.findIndex(x => x.item_name==req.params.itemname);
        var mainindex = data.system_info[sysindex].item_info[itemindex].main_category_info.findIndex(x => x.main_category_name==req.params.mainname);
        if(mainindex>=0)
        {
            res.status(201).json({
                msg: 'exist'
            }); 
        }
        else
        {
            data.system_info[sysindex].item_info[itemindex].main_category_info.push({
                '_id':new ObjectId(),
                main_category_name:req.params.mainname
            });
            data.save(function(err, result) { 
                if (err) {
                    return res.status(500).json({
                        title: 'An error occurred',
                        error: err
                    });
                }
                else
                {
                    Thogupu.Service.aggregate([
                        { $match:{"service_name":{ $in: services }}},  
                        { $unwind: '$system_info' },
                        { $match:{"system_info.system_name":{ $in: systems }}},  
                        { $unwind: '$system_info.item_info' },
                        { $match:{"system_info.item_info.item_name":{ $in: items }}},  
                        { $unwind: '$system_info.item_info.main_category_info' },
                        {
                            $group:
                            {
                                _id: {'_id':'$system_info.item_info.main_category_info.main_category_name'}
                                
                            }
                        },
                        {
                            $project:
                            {
                                _id:'$_id._id',
                                id:'$_id._id',
                                name:'$_id._id'
                            }
                        },
                        { 
                            $sort : { _id : 1}
                        }
                    ], function (err, result) {
                        if (err) {
                            next(err);
                        } 
                        else 
                        {
                            res.status(201).json({
                                msg: 'save',
                                mainCatgList:result
                            }); 
                        }
                    });
                }
            });
        }
    });
});

router.get('/qc/tempaddsubcatg/:sname/:sysname/:itemname/:mainname/:subname/:services/:systems/:items/:maincatgs',jwtAuth, function (req, res, next) {
   
    var services=[];
    var systems=[];
    var items=[];
    var maincatgs=[];

    var bulkquery=JSON.parse(req.params.services);
    bulkquery.forEach(function(item){
        services.push(item.name);
    });
    var bulkquery2=JSON.parse(req.params.systems);
    bulkquery2.forEach(function(item){
        systems.push(item.name);
    });
    var bulkquery3=JSON.parse(req.params.items);
    bulkquery3.forEach(function(item){
        items.push(item.name);
    });
    var bulkquery4=JSON.parse(req.params.maincatgs);
    bulkquery4.forEach(function(item){
        maincatgs.push(item.name);
    });

    Thogupu.Service.findOne({service_name:req.params.sname},function(err, data){ 
        var sysindex = data.system_info.findIndex(x => x.system_name==req.params.sysname);
        var itemindex = data.system_info[sysindex].item_info.findIndex(x => x.item_name==req.params.itemname);
        var mainindex = data.system_info[sysindex].item_info[itemindex].main_category_info.findIndex(x => x.main_category_name==req.params.mainname);
        var subindex = data.system_info[sysindex].item_info[itemindex].main_category_info[mainindex].sub_category_info.findIndex(x => x.sub_category_name==req.params.subname);
      

        if(subindex>=0)
        {
            res.status(201).json({
                msg: 'exist'
            }); 
        }
        else
        {
            data.system_info[sysindex].item_info[itemindex].main_category_info[mainindex].sub_category_info.push({
                '_id':new ObjectId(),
                sub_category_name:req.params.subname
            });
            data.save(function(err, result) { 
                if (err) {
                    return res.status(500).json({
                        title: 'An error occurred',
                        error: err
                    });
                }
                else
                {
                    Thogupu.Service.aggregate([
                        { $match:{"service_name":{ $in: services }}},  
                        { $unwind: '$system_info' },
                        { $match:{"system_info.system_name":{ $in: systems }}},  
                        { $unwind: '$system_info.item_info' },
                        { $match:{"system_info.item_info.item_name":{ $in: items }}},  
                        { $unwind: '$system_info.item_info.main_category_info' },
                        { $match:{"system_info.item_info.main_category_info.main_category_name":{ $in: maincatgs }}},  
                        { $unwind: '$system_info.item_info.main_category_info.sub_category_info' },
                        {
                            $group:
                            {
                                _id: {'_id':'$system_info.item_info.main_category_info.sub_category_info.sub_category_name'}
                                
                            }
                        },
                        {
                            $project:
                            {
                                _id:'$_id._id',
                                id:'$_id._id',
                                name:'$_id._id'
                            }
                        },
                        { 
                            $sort : { _id : 1}
                        }
                    ], function (err, result) {
                        if (err) {
                            next(err);
                        } 
                        else 
                        {
                            res.status(201).json({
                                msg: 'save',
                                subCatgList:result
                            }); 
                        }
                    });
                }
            });
        }
    });
});

router.get('/qc/tempaddparameter/:sname/:sysname/:itemname/:mainname/:subname/:paramname/:services/:systems/:items/:maincatgs/:subcatgs',jwtAuth, function (req, res, next) {
    
    var services=[];
    var systems=[];
    var items=[];
    var maincatgs=[];
    var subcatgs=[];

    var bulkquery=JSON.parse(req.params.services);
    bulkquery.forEach(function(item){
        services.push(item.name);
    });
    var bulkquery2=JSON.parse(req.params.systems);
    bulkquery2.forEach(function(item){
        systems.push(item.name);
    });
    var bulkquery3=JSON.parse(req.params.items);
    bulkquery3.forEach(function(item){
        items.push(item.name);
    });
    var bulkquery4=JSON.parse(req.params.maincatgs);
    bulkquery4.forEach(function(item){
        maincatgs.push(item.name);
    });
    var bulkquery5=JSON.parse(req.params.subcatgs);
    bulkquery5.forEach(function(item){
        subcatgs.push(item.name);
    });

    Thogupu.Service.findOne({service_name:req.params.sname},function(err, data){ 
        var sysindex = data.system_info.findIndex(x => x.system_name==req.params.sysname);
        var itemindex = data.system_info[sysindex].item_info.findIndex(x => x.item_name==req.params.itemname);
        var mainindex = data.system_info[sysindex].item_info[itemindex].main_category_info.findIndex(x => x.main_category_name==req.params.mainname);
        var subindex = data.system_info[sysindex].item_info[itemindex].main_category_info[mainindex].sub_category_info.findIndex(x => x.sub_category_name==req.params.subname);
        var paramindex = data.system_info[sysindex].item_info[itemindex].main_category_info[mainindex].sub_category_info[subindex].parameter_info.findIndex(x => x.parameter_name==req.params.paramname);
        if(paramindex>=0)
        {
            res.status(201).json({
                msg: 'exist'
            }); 
        }
        else
        {
            data.system_info[sysindex].item_info[itemindex].main_category_info[mainindex].sub_category_info[subindex].parameter_info.push({
                '_id':new ObjectId(),
                parameter_name:req.params.paramname
            });
            data.save(function(err, result) { 
                if (err) {
                    return res.status(500).json({
                        title: 'An error occurred',
                        error: err
                    });
                }
                else
                {
                    Thogupu.Service.aggregate([
                        { $match:{"service_name":{ $in: services }}},  
                        { $unwind: '$system_info' },
                        { $match:{"system_info.system_name":{ $in: systems }}},  
                        { $unwind: '$system_info.item_info' },
                        { $match:{"system_info.item_info.item_name":{ $in: items }}},  
                        { $unwind: '$system_info.item_info.main_category_info' },
                        { $match:{"system_info.item_info.main_category_info.main_category_name":{ $in: maincatgs }}},  
                        { $unwind: '$system_info.item_info.main_category_info.sub_category_info' },
                        { $match:{"system_info.item_info.main_category_info.sub_category_info.sub_category_name":{ $in: subcatgs }}},
                        { $unwind: '$system_info.item_info.main_category_info.sub_category_info.parameter_info' },
                        {
                            $group:
                            {
                                _id: {'_id':'$system_info.item_info.main_category_info.sub_category_info.parameter_info.parameter_name'}
                                
                            }
                        },
                        {
                            $project:
                            {
                                _id:'$_id._id',
                                id:'$_id._id',
                                name:'$_id._id'
                            }
                        },
                        { 
                            $sort : { _id : 1}
                        }
                    ], function (err, result) {
                        if (err) {
                            next(err);
                        } 
                        else 
                        {
                            res.status(201).json({
                                msg: 'save',
                                paramsList:result
                            }); 
                        }
                    });
                }
            });
        }
    });
});

router.get('/qc/tempaddcode/:sname/:cname/:services',jwtAuth, function (req, res, next) {
    var services=[];
    var bulkquery=JSON.parse(req.params.services);
    bulkquery.forEach(function(item){
        services.push(item.name);
    });
    Thogupu.Service.findOne({service_name:req.params.sname},function(err, data){ 
        var index = data.code_info.findIndex(x => x.code_name==req.params.cname);
        if(index>=0)
        {
            res.status(201).json({
                msg: 'exist'
            }); 
        }
        else
        {
            data.code_info.push({
                '_id':new ObjectId(),
                code_name:req.params.cname
            });
            data.save(function(err, result) { 
                if (err) {
                    return res.status(500).json({
                        title: 'An error occurred',
                        error: err
                    });
                }
                else
                {
                    Thogupu.Service.aggregate([
                        { $match:{"service_name":{ $in: services }}},  
                        { $unwind: '$code_info' },
                        {
                            $group:
                            {
                                _id: {'_id':'$code_info.code_name'}
                                
                            }
                        },
                        {
                            $project:
                            {
                                _id:'$_id._id',
                                id:'$_id._id',
                                name:'$_id._id'
                            }
                        },
                        { 
                            $sort : { _id : 1}
                        }
                    ], function (err, result) {
                        if (err) {
                            next(err);
                        } 
                        else 
                        {
                            res.status(201).json({
                                msg: 'save',
                                codeList:result
                            }); 
                        }
                    });
                }
            });
        }
    });
});

router.get('/qc/changeservice/:sname',jwtAuth, function (req, res, next) {
    Thogupu.Service.aggregate([
        { $match:{"service_name": req.params.sname }},  
        { $unwind: '$deliverable_info' },
        {
            $group:
            {
                _id: {'_id':'$deliverable_info.deliverable_name'}
                
            }
        },
        {
            $project:
            {
                _id:'$_id._id',
                id:'$_id._id',
                name:'$_id._id'
            }
        },
        { 
            $sort : { _id : 1}
        }
    ], function (err, result1) {
        if (err) {
            next(err);
        } 
        else 
        {
            Thogupu.Service.aggregate([
                { $match:{"service_name": req.params.sname }},  
                { $unwind: '$system_info' },
                {
                    $group:
                    {
                        _id: {'_id':'$system_info.system_name'}
                        
                    }
                },
                {
                    $project:
                    {
                        _id:'$_id._id',
                        id:'$_id._id',
                        name:'$_id._id'
                    }
                },
                { 
                    $sort : { _id : 1}
                }
            ], function (err, result2) {
                if (err) {
                    next(err);
                } 
                else 
                {
                    Thogupu.Service.aggregate([
                        { $match:{"service_name": req.params.sname }},  
                        { $unwind: '$code_info' },
                        {
                            $group:
                            {
                                _id: {'_id':'$code_info.code_name'}
                                
                            }
                        },
                        {
                            $project:
                            {
                                _id:'$_id._id',
                                id:'$_id._id',
                                name:'$_id._id'
                            }
                        },
                        { 
                            $sort : { _id : 1}
                        }
                    ], function (err, result3) {
                        if (err) {
                            next(err);
                        } 
                        else 
                        {
                            res.status(201).json({
                                msg: 'save',
                                dellist:result1,
                                syslist:result2,
                                codelist:result3
                            }); 
                        }
                    });
                }
            });
        }
    });
});

router.get('/qc/changedeliverable/:sname/:dname',jwtAuth, function (req, res, next) {
    Thogupu.Service.aggregate([
        { $match:{"service_name": req.params.sname }},  
        { $unwind: '$deliverable_info' },
        { $match:{"deliverable_info.deliverable_name": req.params.dname }},  
        { $unwind: '$deliverable_info.sub_deliverable_info' },
        {
            $group:
            {
                _id: {'_id':'$deliverable_info.sub_deliverable_info.sub_deliverable_name'}
                
            }
        },
        {
            $project:
            {
                _id:'$_id._id',
                sub_deliverable_name:'$_id._id'
            }
        },
        { 
            $sort : { _id : 1}
        }
    ], function (err, result) {
        if (err) {
            next(err);
        } 
        else 
        {
            res.json(result);
        }
    });
});

router.get('/qc/changesystem/:sname/:sysname',jwtAuth, function (req, res, next) {
    Thogupu.Service.aggregate([
        { $match:{"service_name": req.params.sname }},  
        { $unwind: '$system_info' },
        { $match:{"system_info.system_name": req.params.sysname }},  
        { $unwind: '$system_info.item_info' },
        {
            $group:
            {
                _id: {'_id':'$system_info.item_info.item_name'}
                
            }
        },
        {
            $project:
            {
                _id:'$_id._id',
                item_name:'$_id._id'
            }
        },
        { 
            $sort : { _id : 1}
        }
    ], function (err, result) {
        if (err) {
            next(err);
        } 
        else 
        {
            res.json(result);
        }
    });
});

router.get('/qc/changeitem/:sname/:sysname/:itemname',jwtAuth, function (req, res, next) {
    Thogupu.Service.aggregate([
        { $match:{"service_name": req.params.sname }},  
        { $unwind: '$system_info' },
        { $match:{"system_info.system_name": req.params.sysname }},  
        { $unwind: '$system_info.item_info' },
        { $match:{"system_info.item_info.item_name": req.params.itemname }},
        { $unwind: '$system_info.item_info.main_category_info' },
        {
            $group:
            {
                _id: {'_id':'$system_info.item_info.main_category_info.main_category_name'}
                
            }
        },
        {
            $project:
            {
                _id:'$_id._id',
                main_category_name:'$_id._id'
            }
        },
        { 
            $sort : { _id : 1}
        }
    ], function (err, result) {
        if (err) {
            next(err);
        } 
        else 
        {
            res.json(result);
        }
    });
});

router.get('/qc/changemaincatg/:sname/:sysname/:itemname/:mainname',jwtAuth, function (req, res, next) {
    Thogupu.Service.aggregate([
        { $match:{"service_name": req.params.sname }},  
        { $unwind: '$system_info' },
        { $match:{"system_info.system_name": req.params.sysname }},  
        { $unwind: '$system_info.item_info' },
        { $match:{"system_info.item_info.item_name": req.params.itemname }},
        { $unwind: '$system_info.item_info.main_category_info' },
        { $match:{"system_info.item_info.main_category_info.main_category_name": req.params.mainname }},
        { $unwind: '$system_info.item_info.main_category_info.sub_category_info' },
        {
            $group:
            {
                _id: {'_id':'$system_info.item_info.main_category_info.sub_category_info.sub_category_name'}
                
            }
        },
        {
            $project:
            {
                _id:'$_id._id',
                sub_category_name:'$_id._id'
            }
        },
        { 
            $sort : { _id : 1}
        }
    ], function (err, result) {
        if (err) {
            next(err);
        } 
        else 
        {
            res.json(result);
        }
    });
});

router.get('/qc/changesubcatg/:sname/:sysname/:itemname/:mainname/:subname',jwtAuth, function (req, res, next) {
    Thogupu.Service.aggregate([
        { $match:{"service_name": req.params.sname }},  
        { $unwind: '$system_info' },
        { $match:{"system_info.system_name": req.params.sysname }},  
        { $unwind: '$system_info.item_info' },
        { $match:{"system_info.item_info.item_name": req.params.itemname }},
        { $unwind: '$system_info.item_info.main_category_info' },
        { $match:{"system_info.item_info.main_category_info.main_category_name": req.params.mainname }},
        { $unwind: '$system_info.item_info.main_category_info.sub_category_info' },
        { $match:{"system_info.item_info.main_category_info.sub_category_info.sub_category_name": req.params.subname }},
        { $unwind: '$system_info.item_info.main_category_info.sub_category_info.parameter_info' },
        {
            $group:
            {
                _id: {'_id':'$system_info.item_info.main_category_info.sub_category_info.parameter_info.parameter_name'}
                
            }
        },
        {
            $project:
            {
                _id:'$_id._id',
                parameter_name:'$_id._id'
            }
        },
        { 
            $sort : { _id : 1}
        }
    ], function (err, result) {
        if (err) {
            next(err);
        } 
        else 
        {
            res.json(result);
        }
    });
});

router.get('/qc/employeewiseview', function (req, res, next) {
    QC.Project.aggregate([
        { $unwind: '$revision_info' },
        {
            $group:
            {
                _id: {'_id':'$project_name'},
                lastrevision: { $last: "$revision_info" } 
            }
        },
        { $unwind: '$lastrevision' },   
        { $unwind: '$lastrevision.deliverable_info' },
        { $match:{"lastrevision.deliverable_info.deliverable_status":{ $eq: 'Approved' }}},   
        { $unwind: '$lastrevision.deliverable_info.review_info' },
        {
            $group:
            {
                _id: {'_id':'$lastrevision.deliverable_info.review_info.prepared_by'},
                star_info:
                { 
                    $addToSet: 
                    {
                        marks:'$lastrevision.deliverable_info.review_info.finalqc_marks',
                    }
                }
            }
        },
        {
            $project:
            {
                _id:'$_id._id',
                star_info:'$star_info'
            }
        },
        { 
            $sort : { _id : 1}
        }
    ], function (err, result1) {
        if (err) {
            next(err);
        } 
        else 
        {
            QC.Project.aggregate([
                { $unwind: '$revision_info' },   
                {
                    $group:
                    {
                        _id: {'_id':'$project_name'},
                        lastrevision: { $last: "$revision_info" } 
                    }
                },
                { $unwind: '$lastrevision.deliverable_info' },
                { $match:{"lastrevision.deliverable_info.deliverable_status":{ $eq: 'Approved' }}},   
                { $unwind: '$lastrevision.deliverable_info.review_info' },
                {
                    $group:
                    {
                        _id: {'_id':'$lastrevision.deliverable_info.review_info.reviewed_by'},
                        star_info:
                        { 
                            $addToSet: 
                            {
                                marks:'$lastrevision.deliverable_info.review_info.finalqc_marks'
                            }
                        }
                    }
                },
                {
                    $project:
                    {
                        _id:'$_id._id',
                        star_info:'$star_info'
                    }
                },
                { 
                    $sort : { _id : 1}
                }
            ], function (err, result2) {
                if (err) {
                    next(err);
                } 
                else 
                {
                    QC.Project.aggregate([
                        { $unwind: '$revision_info' },   
                        {
                            $group:
                            {
                                _id: {'_id':'$project_name'},
                                lastrevision: { $last: "$revision_info" } 
                            }
                        },
                        { $unwind: '$lastrevision.deliverable_info' },
                        { $match:{"lastrevision.deliverable_info.deliverable_status":{ $eq: 'Approved' }}},   
                        { $unwind: '$lastrevision.deliverable_info.review_info' },
                        {
                            $group:
                            {
                                _id: {'_id':'$lastrevision.deliverable_info.review_info.approved_by'},
                                star_info:
                                { 
                                    $addToSet: 
                                    {
                                        marks:'$lastrevision.deliverable_info.review_info.finalqc_marks'
                                    }
                                }
                            }
                        },
                        {
                            $project:
                            {
                                _id:'$_id._id',
                                star_info:'$star_info'
                            }
                        },
                        { 
                            $sort : { _id : 1}
                        }
                    ], function (err, result3) {
                        if (err) {
                            next(err);
                        } 
                        else 
                        {
                            Thogupu.User.aggregate([ 
                                {
                                    $group: {
                                        _id:{'_id':'$_id','user_name':'$user_name','emp_code':'$emp_code','service_name':'$service_name','access_level':'$access_level','profile_img':'$profile_img'}
                                    }
                                },
                                {
                                    $project:
                                    {
                                        _id:'$_id._id',
                                        user_name:'$_id.user_name',
                                        emp_code:'$_id.emp_code',
                                        service_name:'$_id.service_name',
                                        access_level:'$_id.access_level',
                                        profile_img:'$_id.profile_img'
                                    }
                                }
                            ], function (err, result) {
                                if (err) {
                                    next(err);
                                } 
                                else 
                                {
                                    function calStarRating(val)
                                    {
                                        if(val>=100)
                                        {
                                            return 5;
                                        }
                                        else if(val>=80 && val<100)
                                        {
                                            return 4;
                                        }
                                        else if(val>=60 && val<80)
                                        {
                                            return 3;
                                        }
                                        else if(val>=40 && val<60)
                                        {
                                            return 2;
                                        }
                                        else if(val<40)
                                        {
                                            return 1;
                                        }
                                        else
                                        {
                                            return 0;
                                        }
                                    }

                                    var subDocument=[];
                                    result1.forEach(function(item){
                                        var index = result.findIndex(x => x.user_name==item._id);
                                        if(index>=0)
                                        {
                                            var totalMark=0;
                                            item.star_info.forEach(function(m){
                                                totalMark=totalMark+m.marks;
                                            });
                                            var avgMark=totalMark/(item.star_info.length);
                                            var noofstar=calStarRating(avgMark);
                                            subDocument.push({
                                                user_name:result[index].user_name,
                                                emp_code:result[index].emp_code,
                                                service_name:result[index].service_name,
                                                access_level:result[index].access_level,
                                                profile_img:result[index].profile_img,
                                                noofstar:noofstar
                                            });
                                        }
                                    });

                                    result2.forEach(function(item){
                                        var index = result.findIndex(x => x.user_name==item._id);
                                        if(index>=0)
                                        {
                                            var totalMark=0;
                                            item.star_info.forEach(function(m){
                                                totalMark=totalMark+m.marks;
                                            });
                                            var avgMark=totalMark/(item.star_info.length);
                                            var noofstar=calStarRating(avgMark);
                                            subDocument.push({
                                                user_name:result[index].user_name,
                                                emp_code:result[index].emp_code,
                                                service_name:result[index].service_name,
                                                access_level:result[index].access_level,
                                                profile_img:result[index].profile_img,
                                                noofstar:noofstar
                                            });
                                        }
                                    });

                                    result3.forEach(function(item){
                                        var index = result.findIndex(x => x.user_name==item._id);
                                        if(index>=0)
                                        {
                                            var totalMark=0;
                                            item.star_info.forEach(function(m){
                                                totalMark=totalMark+m.marks;
                                            });
                                            var avgMark=totalMark/(item.star_info.length);
                                            var noofstar=calStarRating(avgMark);
                                            subDocument.push({
                                                user_name:result[index].user_name,
                                                emp_code:result[index].emp_code,
                                                access_level:result[index].access_level,
                                                service_name:result[index].service_name,
                                                profile_img:result[index].profile_img,
                                                noofstar:noofstar
                                            });
                                        }
                                    });

                                    res.status(201).json({
                                        starRating:subDocument
                                    });
                                }
                            });
                        }
                    });
                }
            });
        }
    });
});

router.get('/qc/projectwiseview/:sortby', function (req, res, next) {
    
    var sortArray={ };
    if(req.params.sortby=='project_name')
    {
        sortArray={ project_name : 1};
    }
    else if(req.params.sortby=='project_type')
    {
        sortArray={ project_type : 1};
    }
    else if(req.params.sortby=='project_country')
    {
        sortArray={ project_country : 1};
    }
    else if(req.params.sortby=='_id')
    {
        sortArray={ _id : 1};
    }

    QC.Project.aggregate([
        {
            $group:
            {
                _id: {'_id':'$_id','project_name':'$project_name','project_type':'$project_type','project_country':'$project_country','project_state':'$project_state','leader_info':'$leader_info','engineers_info':'$engineers_info'},
            }
        },
        {
            $project:
            {
                _id:'$_id._id',
                project_name:'$_id.project_name',
                project_type:'$_id.project_type',
                project_country:'$_id.project_country',
                project_state:'$_id.project_state',
                leader_info:'$_id.leader_info',
                engineers_info:'$_id.engineers_info'
            }
        },
        { 
            $sort : sortArray
        }
    ], function (err, result) {
        if (err) {
            next(err);
        } 
        else 
        {
            res.status(201).json({
                projectInfo:result
            });
        }
    });
});

router.get('/qc/getemployeeprojects/:uname/:acclevel/:sortby', function (req, res, next) {

    var filterArray=[{"lastrevision.deliverable_info.deliverable_status":{ $eq: 'Approved' }}];
    
    var sortArray={ };
    if(req.params.sortby=='project_name')
    {
        sortArray={ project_name : 1};
    }
    else if(req.params.sortby=='project_type')
    {
        sortArray={ project_type : 1};
    }
    else if(req.params.sortby=='project_country')
    {
        sortArray={ project_country : 1};
    }
    else if(req.params.sortby=='_id')
    {
        sortArray={ _id : 1};
    }

    if(req.params.acclevel=='Manager')
    {
        filterArray.push({"lastrevision.deliverable_info.team_manager":{ $eq: req.params.uname }});
    }
    else if(req.params.acclevel=='Team Leader')
    {
        filterArray.push({"lastrevision.deliverable_info.team_leader":{ $eq: req.params.uname }});
    }
    else if(req.params.acclevel=='Service Engineer')
    {
        filterArray.push({"lastrevision.deliverable_info.service_engineer":{ $eq: req.params.uname }});
    }

    QC.Project.aggregate([
        { $unwind: '$revision_info' },
        {
            $group:
            {
                _id: {'_id':'$_id','project_name':'$project_name','project_type':'$project_type','project_country':'$project_country','project_state':'$project_state'},
                lastrevision: { $last: "$revision_info" } 
            }
        },
        { $unwind: '$lastrevision' },   
        { $unwind: '$lastrevision.deliverable_info' },
        { $match:{ $and : filterArray } }, 
        { $unwind: '$lastrevision.deliverable_info.review_info' },
        {
            $group:
            {
                _id: {'_id':'$_id._id','project_name':'$_id.project_name','project_type':'$_id.project_type','project_country':'$_id.project_country','project_state':'$_id.project_state'},
                del_info:
                { 
                    $addToSet: 
                    {
                        drawing_number:'$lastrevision.deliverable_info.drawing_number',
                        drawing_title:'$lastrevision.deliverable_info.drawing_title',
                        deliverable_status:'$lastrevision.deliverable_info.deliverable_status'
                    }
                },
                lastreview: { $last: "$lastrevision.deliverable_info.review_info" } 
            }
        },
        { $unwind: '$del_info' },   
        { $unwind: '$lastreview' },   
        {
            $group:
            {
                _id: {'_id':'$_id._id','project_name':'$_id.project_name','project_type':'$_id.project_type','project_country':'$_id.project_country','project_state':'$_id.project_state'},
                deliverable_info:
                { 
                    $addToSet: 
                    {
                        drawing_number:'$del_info.drawing_number',
                        drawing_title:'$del_info.drawing_title',
                        deliverable_status:'$del_info.deliverable_status',
                        selfqc_marks:'$lastreview.selfqc_marks',
                        peerqc_marks:'$lastreview.peerqc_marks',
                        finalqc_marks:'$lastreview.finalqc_marks'
                    }
                }
            }
        },
        {
            $project:
            {
                _id:'$_id._id',
                project_name:'$_id.project_name',
                project_type:'$_id.project_type',
                project_country:'$_id.project_country',
                project_state:'$_id.project_state',
                deliverable_info:'$deliverable_info'
            }
        },
        { 
            $sort : sortArray
        }
    ], function (err, result) {
        if (err) {
            next(err);
        } 
        else 
        {
            var totalProjects=0;
            var totalDeliverables=0;
            var totalMarks=0;
            var i=0;
            var avgRating=0;
            result.forEach(function(item){
                totalProjects++;
                totalDeliverables=totalDeliverables+item.deliverable_info.length;
                item.deliverable_info.forEach(function(del){
                    if(del.deliverable_status=='Approved')
                    {
                        i++;
                        totalMarks=totalMarks+del.finalqc_marks;
                    }
                });
            });
            avgRating=totalMarks/i;

            res.status(201).json({
                starRating:result,
                totalProjects:totalProjects,
                totalDeliverables:totalDeliverables,
                avgRating:avgRating
            });
        }
    });
});

router.get('/qc/getprojectdetail/:pid', function (req, res, next) {
    QC.Project.aggregate([
        { $match:{"_id":{ $eq: ObjectId(req.params.pid) }}},    
        { $unwind: '$revision_info' },
        {
            $group:
            {
                _id: {'_id':'$_id','project_name':'$project_name','project_type':'$project_type','project_subtype_info':'$project_subtype_info','project_country':'$project_country','project_state':'$project_state','client_name':'$client_name','architect_name':'$architect_name','manager_info':'$manager_info','leader_info':'$leader_info','engineers_info':'$engineers_info'},
                lastrevision: { $last: "$revision_info" } 
            }
        },
        { $unwind: '$lastrevision' },   
        { $unwind: '$lastrevision.deliverable_info' },
        { $unwind: '$lastrevision.deliverable_info.review_info' },
        {
            $group:
            {
                _id: {'_id':'$_id._id','project_name':'$_id.project_name','project_type':'$_id.project_type','project_subtype_info':'$_id.project_subtype_info','project_country':'$_id.project_country','project_state':'$_id.project_state','client_name':'$_id.client_name','architect_name':'$_id.architect_name','manager_info':'$_id.manager_info','leader_info':'$_id.leader_info','engineers_info':'$_id.engineers_info','rid':'$lastrevision._id','project_services':'$lastrevision.project_services','project_systems':'$lastrevision.project_systems','project_items':'$lastrevision.project_items','project_main_category':'$lastrevision.project_main_category','project_sub_category':'$lastrevision.project_sub_category','project_parameter':'$lastrevision.project_parameter','project_codes':'$lastrevision.project_codes'},
                del_info:
                { 
                    $addToSet: 
                    {
                        did:'$lastrevision.deliverable_info._id',
                        drawing_number:'$lastrevision.deliverable_info.drawing_number',
                        drawing_title:'$lastrevision.deliverable_info.drawing_title',
                        delivered_date:'$lastrevision.deliverable_info.delivered_date',
                        team_leader:'$lastrevision.deliverable_info.team_leader',
                        service_engineer:'$lastrevision.deliverable_info.service_engineer',
                        deliverable_status:'$lastrevision.deliverable_info.deliverable_status',
                        created_date:'$lastrevision.deliverable_info.created_date',
                        deliverable_category:'$lastrevision.deliverable_info.deliverable_category',
                        deliverable_subcategory:'$lastrevision.deliverable_info.deliverable_subcategory',
                        deliverable_services:'$lastrevision.deliverable_info.deliverable_services',
                        deliverable_systems:'$lastrevision.deliverable_info.deliverable_systems',
                        deliverable_items:'$lastrevision.deliverable_info.deliverable_items',
                        deliverable_main_category:'$lastrevision.deliverable_info.deliverable_main_category',
                        deliverable_sub_category:'$lastrevision.deliverable_info.deliverable_sub_category',
                        deliverable_parameter:'$lastrevision.deliverable_info.deliverable_parameter',
                        deliverable_codes:'$lastrevision.deliverable_info.deliverable_codes',
                        review_info:'$lastrevision.deliverable_info.review_info'
                    }
                }/* ,
                lastreview: { $last: "$lastrevision.deliverable_info.review_info" }  */
            }
        },
        { $unwind: '$del_info' },   
        { $unwind: '$del_info.review_info' },   
        { $match:{"del_info.review_info.approved_status":{ $ne: 'Rejected' }}},    
        {
            $group:
            {
                _id: {'_id':'$_id._id','project_name':'$_id.project_name','project_type':'$_id.project_type','project_subtype_info':'$_id.project_subtype_info','project_country':'$_id.project_country','project_state':'$_id.project_state','client_name':'$_id.client_name','architect_name':'$_id.architect_name','manager_info':'$_id.manager_info','leader_info':'$_id.leader_info','engineers_info':'$_id.engineers_info','rid':'$_id.rid','project_services':'$_id.project_services','project_systems':'$_id.project_systems','project_items':'$_id.project_items','project_main_category':'$_id.project_main_category','project_sub_category':'$_id.project_sub_category','project_parameter':'$_id.project_parameter','project_codes':'$_id.project_codes'},
                deliverable_info:
                { 
                    $addToSet: 
                    {
                        did:'$del_info.did',
                        drawing_number:'$del_info.drawing_number',
                        drawing_title:'$del_info.drawing_title',
                        delivered_date:'$del_info.delivered_date',
                        team_leader:'$del_info.team_leader',
                        service_engineer:'$del_info.service_engineer',
                        deliverable_status:'$del_info.deliverable_status',
                        created_date:'$del_info.created_date',
                        deliverable_category:'$del_info.deliverable_category',
                        deliverable_subcategory:'$del_info.deliverable_subcategory',
                        deliverable_services:'$del_info.deliverable_services',
                        deliverable_systems:'$del_info.deliverable_systems',
                        deliverable_items:'$del_info.deliverable_items',
                        deliverable_main_category:'$del_info.deliverable_main_category',
                        deliverable_sub_category:'$del_info.deliverable_sub_category',
                        deliverable_parameter:'$del_info.deliverable_parameter',
                        deliverable_codes:'$del_info.deliverable_codes',
                        revid:'$del_info.review_info._id',
                        selfqc_marks:'$del_info.review_info.selfqc_marks',
                        peerqc_marks:'$del_info.review_info.peerqc_marks',
                        finalqc_marks:'$del_info.review_info.finalqc_marks'
                    }
                }
            }
        },
        {
            $project:
            {
                _id:'$_id._id',
                project_name:'$_id.project_name',
                project_type:'$_id.project_type',
                project_subtype_info:'$_id.project_subtype_info',
                project_country:'$_id.project_country',
                project_state:'$_id.project_state',
                client_name:'$_id.client_name',
                architect_name:'$_id.architect_name',
                manager_info:'$_id.manager_info',
                leader_info:'$_id.leader_info',
                engineers_info:'$_id.engineers_info',
                rid:'$_id.rid',
                project_services:'$_id.project_services',
                project_systems:'$_id.project_systems',
                project_items:'$_id.project_items',
                project_main_category:'$_id.project_main_category',
                project_sub_category:'$_id.project_sub_category',
                project_parameter:'$_id.project_parameter',
                project_codes:'$_id.project_codes',
                deliverable_info:'$deliverable_info'
            }
        },
        { 
            $sort : { _id :1 }
        }
    ], function (err, result) {
        if (err) {
            next(err);
        } 
        else 
        {
            res.json(result);
        }
    });
});

router.get('/qc/getlivedashboard/:from_date/:to_date', function (req, res, next) {
    var farr=req.params.from_date.split("-"); 
    var tarr=req.params.to_date.split("-");

    var condtionArray=[];
    condtionArray.push({"lastrevision.deliverable_info.review_info.approved_date": { "$lte":new Date(tarr[0], tarr[1] - 1, tarr[2]) }})
    condtionArray.push({"lastrevision.deliverable_info.review_info.approved_date": { "$gte":new Date(farr[0], farr[1] - 1, farr[2]) }})

    QC.Project.aggregate([
        { $unwind: '$revision_info' },
        {
            $group:
            {
                _id: {'_id':'$project_name'},
                lastrevision: { $last: "$revision_info" } 
            }
        },
        { $unwind: '$lastrevision' },   
        { $unwind: '$lastrevision.deliverable_info' },
        { $match:{"lastrevision.deliverable_info.deliverable_status":{ $eq: 'Approved' }}},   
        { $unwind: '$lastrevision.deliverable_info.review_info' },
        { $match:{$and: condtionArray }},     
        {
            $group:
            {
                _id: {'_id':'$lastrevision.deliverable_info.review_info.prepared_by'},
                star_info:
                { 
                    $addToSet: 
                    {
                        marks:'$lastrevision.deliverable_info.review_info.finalqc_marks',
                    }
                }
            }
        },
        {
            $project:
            {
                _id:'$_id._id',
                star_info:'$star_info'
            }
        },
        { 
            $sort : { _id : 1}
        }
    ], function (err, result1) {
        if (err) {
            next(err);
        } 
        else 
        {
            QC.Project.aggregate([
                { $unwind: '$revision_info' },   
                {
                    $group:
                    {
                        _id: {'_id':'$project_name'},
                        lastrevision: { $last: "$revision_info" } 
                    }
                },
                { $unwind: '$lastrevision.deliverable_info' },
                { $match:{"lastrevision.deliverable_info.deliverable_status":{ $eq: 'Approved' }}},   
                { $unwind: '$lastrevision.deliverable_info.review_info' },
                { $match:{$and: condtionArray }},     
                {
                    $group:
                    {
                        _id: {'_id':'$lastrevision.deliverable_info.review_info.reviewed_by'},
                        star_info:
                        { 
                            $addToSet: 
                            {
                                marks:'$lastrevision.deliverable_info.review_info.finalqc_marks'
                            }
                        }
                    }
                },
                {
                    $project:
                    {
                        _id:'$_id._id',
                        star_info:'$star_info'
                    }
                },
                { 
                    $sort : { _id : 1}
                }
            ], function (err, result2) {
                if (err) {
                    next(err);
                } 
                else 
                {
                    QC.Project.aggregate([
                        { $unwind: '$revision_info' },   
                        {
                            $group:
                            {
                                _id: {'_id':'$project_name'},
                                lastrevision: { $last: "$revision_info" } 
                            }
                        },
                        { $unwind: '$lastrevision.deliverable_info' },
                        { $match:{"lastrevision.deliverable_info.deliverable_status":{ $eq: 'Approved' }}},   
                        { $unwind: '$lastrevision.deliverable_info.review_info' },
                        { $match:{$and: condtionArray }},     
                        {
                            $group:
                            {
                                _id: {'_id':'$lastrevision.deliverable_info.review_info.approved_by'},
                                star_info:
                                { 
                                    $addToSet: 
                                    {
                                        marks:'$lastrevision.deliverable_info.review_info.finalqc_marks'
                                    }
                                }
                            }
                        },
                        {
                            $project:
                            {
                                _id:'$_id._id',
                                star_info:'$star_info'
                            }
                        },
                        { 
                            $sort : { _id : 1}
                        }
                    ], function (err, result3) {
                        if (err) {
                            next(err);
                        } 
                        else 
                        {
                            Thogupu.User.aggregate([ 
                                {
                                    $group: {
                                        _id:{'_id':'$_id','user_name':'$user_name','emp_code':'$emp_code','service_name':'$service_name','access_level':'$access_level','profile_img':'$profile_img'}
                                    }
                                },
                                {
                                    $project:
                                    {
                                        _id:'$_id._id',
                                        user_name:'$_id.user_name',
                                        emp_code:'$_id.emp_code',
                                        service_name:'$_id.service_name',
                                        access_level:'$_id.access_level',
                                        profile_img:'$_id.profile_img'
                                    }
                                }
                            ], function (err, result) {
                                if (err) {
                                    next(err);
                                } 
                                else 
                                {
                                    function calStarRating(val)
                                    {
                                        if(val>=100)
                                        {
                                            return 5;
                                        }
                                        else if(val>=80 && val<100)
                                        {
                                            return 4;
                                        }
                                        else if(val>=60 && val<80)
                                        {
                                            return 3;
                                        }
                                        else if(val>=40 && val<60)
                                        {
                                            return 2;
                                        }
                                        else if(val<40)
                                        {
                                            return 1;
                                        }
                                        else
                                        {
                                            return 0;
                                        }
                                    }

                                    var subDocument=[];
                                    result1.forEach(function(item){
                                        var index = result.findIndex(x => x.user_name==item._id);
                                        if(index>=0)
                                        {
                                            var totalMark=0;
                                            item.star_info.forEach(function(m){
                                                totalMark=totalMark+m.marks;
                                            });
                                            var avgMark=totalMark/(item.star_info.length);
                                            var noofstar=calStarRating(avgMark);
                                            subDocument.push({
                                                user_name:result[index].user_name,
                                                emp_code:result[index].emp_code,
                                                service_name:result[index].service_name,
                                                access_level:result[index].access_level,
                                                profile_img:result[index].profile_img,
                                                avgMark:avgMark,
                                                noofstar:noofstar
                                            });
                                        }
                                    });

                                    result2.forEach(function(item){
                                        var index = result.findIndex(x => x.user_name==item._id);
                                        if(index>=0)
                                        {
                                            var totalMark=0;
                                            item.star_info.forEach(function(m){
                                                totalMark=totalMark+m.marks;
                                            });
                                            var avgMark=totalMark/(item.star_info.length);
                                            var noofstar=calStarRating(avgMark);
                                            subDocument.push({
                                                user_name:result[index].user_name,
                                                emp_code:result[index].emp_code,
                                                service_name:result[index].service_name,
                                                access_level:result[index].access_level,
                                                profile_img:result[index].profile_img,
                                                avgMark:avgMark,
                                                noofstar:noofstar
                                            });
                                        }
                                    });

                                    result3.forEach(function(item){
                                        var index = result.findIndex(x => x.user_name==item._id);
                                        if(index>=0)
                                        {
                                            var totalMark=0;
                                            item.star_info.forEach(function(m){
                                                totalMark=totalMark+m.marks;
                                            });
                                            var avgMark=totalMark/(item.star_info.length);
                                            var noofstar=calStarRating(avgMark);
                                            subDocument.push({
                                                user_name:result[index].user_name,
                                                emp_code:result[index].emp_code,
                                                access_level:result[index].access_level,
                                                service_name:result[index].service_name,
                                                profile_img:result[index].profile_img,
                                                avgMark:avgMark,
                                                noofstar:noofstar
                                            });
                                        }
                                    });
                                    var achiever_name='';
                                    var achiever_code='';
                                    var achiever_acclevel='';
                                    var achiever_service='';
                                    var achiever_profile='';
                                    var achiever_avgmark='';
                                    var achiever_star='';
                                    if(subDocument.length>0)
                                    {
                                        subDocument.sort(function(a,b) { return a.avgMark > b.avgMark });
                                        achiever_name=subDocument[0].user_name;
                                        achiever_code=subDocument[0].emp_code;
                                        achiever_acclevel=subDocument[0].access_level;
                                        achiever_service=subDocument[0].service_name;
                                        achiever_profile=subDocument[0].profile_img;
                                        achiever_avgmark=subDocument[0].avgMark;
                                        achiever_star=subDocument[0].noofstar;
                                    }

                                    res.status(201).json({
                                        starRating:subDocument,
                                        achiever_name:achiever_name,
                                        achiever_code:achiever_code,
                                        achiever_acclevel:achiever_acclevel,
                                        achiever_service:achiever_service,
                                        achiever_profile:achiever_profile,
                                        achiever_avgmark:achiever_avgmark,
                                        achiever_star:achiever_star
                                    });
                                }
                            });
                        }
                    });
                }
            });
        }
    });
});

router.get('/qc/getdeliverablereport/:pid/:rid/:did/:revid', function (req, res, next) {
    
    QC.Project.findById(ObjectId(req.params.pid),function(err, data){  
        var r=data.revision_info.id(ObjectId(req.params.rid));
        var d=r.deliverable_info.id(ObjectId(req.params.did));
        var rev=d.review_info.id(ObjectId(req.params.revid));
  
        var noof_errors=rev.self_qc_info.filter(function (item) { return item.se_answer == 'No'}).length;
        var nonCompliedArray=[];
        var impactArray=[];
        var sno=1;
        rev.self_qc_info.forEach(function(item){
            if(item.se_answer == 'No')
            {
                nonCompliedArray.push({ 's_no':sno,'checkpoint_name':item.check_point_name });
                item.error_impact.forEach(function(item1){
                    var index = impactArray.findIndex(x => x.type_name==item1.type_name);
                    if(index<0)
                    {
                        impactArray.push({ type_name : item1.type_name });
                    }
                });
                sno++;
            }
        });

        var nonCompliedTable=[{
            columns:[{title:"#",dataKey: "s_no"},{title: "Checkpoint Name", dataKey: "checkpoint_name"}],
            nonCompliedArray:nonCompliedArray
        }];

        var impactTable=[{
            columns:[{title:"#",dataKey: "type_name"}],
            impactArray:impactArray
        }];

        function calStarRating(val)
        {
            if(val>=100)
            {
                return 5;
            }
            else if(val>=80 && val<100)
            {
                return 4;
            }
            else if(val>=60 && val<80)
            {
                return 3;
            }
            else if(val>=40 && val<60)
            {
                return 2;
            }
            else if(val<40)
            {
                return 1;
            }
            else
            {
                return 0;
            }
        }
        
        res.status(201).json({
            project_name:data.project_name,
            drawing_title:d.drawing_title,
            totalCheckpoints:rev.self_qc_info.length,
            noof_errors:noof_errors,
            prepared_by:rev.prepared_by,
            prepared_date:rev.prepared_date,
            reviewed_by:rev.reviewed_by,
            reviewed_date:rev.reviewed_date,
            approved_by:rev.approved_by,
            approved_date:rev.approved_date,
            approved_status:d.deliverable_status,
            selfqc_marks:rev.selfqc_marks,
            peerqc_marks:rev.peerqc_marks,
            noofstar:calStarRating(rev.finalqc_marks),
            revision_time:rev.revision_time,
            qc_remarks:rev.qc_remarks,
            nonCompliedTable:nonCompliedTable,
            impactTable:impactTable
        });
    });
});

router.get('/qc/getprojectreport/:pid', function (req, res, next) {
    QC.Project.aggregate([
        { $match:{"_id":{ $eq: ObjectId(req.params.pid) }}},    
        { $unwind: '$revision_info' },
        {
            $group:
            {
                _id: {'_id':'$_id','project_name':'$project_name','created_date':'$created_date','created_by':'$created_by','project_type':'$project_type','project_subtype_info':'$project_subtype_info','project_country':'$project_country','project_state':'$project_state','client_name':'$client_name','architect_name':'$architect_name','manager_info':'$manager_info','leader_info':'$leader_info','engineers_info':'$engineers_info'},
                lastrevision: { $last: "$revision_info" } 
            }
        },
        { $unwind: '$lastrevision' },   
        { $unwind: '$lastrevision.deliverable_info' },
        { $unwind: '$lastrevision.deliverable_info.review_info' },
        {
            $group:
            {
                _id: {'_id':'$_id._id','project_name':'$_id.project_name','created_date':'$_id.created_date','created_by':'$_id.created_by','project_type':'$_id.project_type','project_subtype_info':'$_id.project_subtype_info','project_country':'$_id.project_country','project_state':'$_id.project_state','client_name':'$_id.client_name','architect_name':'$_id.architect_name','manager_info':'$_id.manager_info','leader_info':'$_id.leader_info','engineers_info':'$_id.engineers_info','rid':'$lastrevision._id','revision_name':'$lastrevision.revision_name','project_services':'$lastrevision.project_services','project_systems':'$lastrevision.project_systems','project_items':'$lastrevision.project_items','project_main_category':'$lastrevision.project_main_category','project_sub_category':'$lastrevision.project_sub_category','project_parameter':'$lastrevision.project_parameter','project_codes':'$lastrevision.project_codes'},
                del_info:
                { 
                    $addToSet: 
                    {
                        did:'$lastrevision.deliverable_info._id',
                        drawing_number:'$lastrevision.deliverable_info.drawing_number',
                        drawing_title:'$lastrevision.deliverable_info.drawing_title',
                        delivered_date:'$lastrevision.deliverable_info.delivered_date',
                        team_leader:'$lastrevision.deliverable_info.team_leader',
                        service_engineer:'$lastrevision.deliverable_info.service_engineer',
                        deliverable_status:'$lastrevision.deliverable_info.deliverable_status',
                        created_date:'$lastrevision.deliverable_info.created_date',
                        created_by:'$lastrevision.deliverable_info.created_by',
                        deliverable_category:'$lastrevision.deliverable_info.deliverable_category',
                        deliverable_subcategory:'$lastrevision.deliverable_info.deliverable_subcategory',
                        deliverable_services:'$lastrevision.deliverable_info.deliverable_services',
                        deliverable_systems:'$lastrevision.deliverable_info.deliverable_systems',
                        deliverable_items:'$lastrevision.deliverable_info.deliverable_items',
                        deliverable_main_category:'$lastrevision.deliverable_info.deliverable_main_category',
                        deliverable_sub_category:'$lastrevision.deliverable_info.deliverable_sub_category',
                        deliverable_parameter:'$lastrevision.deliverable_info.deliverable_parameter',
                        deliverable_codes:'$lastrevision.deliverable_info.deliverable_codes',
                        review_info:'$lastrevision.deliverable_info.review_info'
                    }
                }/* ,
                lastreview: { $last: "$lastrevision.deliverable_info.review_info" }  */
            }
        },
        { $unwind: '$del_info' },   
        { $unwind: '$del_info.review_info' },   
        { $match:{"del_info.review_info.approved_status":{ $ne: 'Rejected' }}},    
        {
            $group:
            {
                _id: {'_id':'$_id._id','project_name':'$_id.project_name','created_date':'$_id.created_date','created_by':'$_id.created_by','project_type':'$_id.project_type','project_subtype_info':'$_id.project_subtype_info','project_country':'$_id.project_country','project_state':'$_id.project_state','client_name':'$_id.client_name','architect_name':'$_id.architect_name','manager_info':'$_id.manager_info','leader_info':'$_id.leader_info','engineers_info':'$_id.engineers_info','rid':'$_id.rid','revision_name':'$_id.revision_name','project_services':'$_id.project_services','project_systems':'$_id.project_systems','project_items':'$_id.project_items','project_main_category':'$_id.project_main_category','project_sub_category':'$_id.project_sub_category','project_parameter':'$_id.project_parameter','project_codes':'$_id.project_codes'},
                deliverable_info:
                { 
                    $addToSet: 
                    {
                        did:'$del_info.did',
                        drawing_number:'$del_info.drawing_number',
                        drawing_title:'$del_info.drawing_title',
                        delivered_date:'$del_info.delivered_date',
                        team_leader:'$del_info.team_leader',
                        service_engineer:'$del_info.service_engineer',
                        deliverable_status:'$del_info.deliverable_status',
                        created_date:'$del_info.created_date',
                        created_by:'$del_info.created_by',
                        deliverable_category:'$del_info.deliverable_category',
                        deliverable_subcategory:'$del_info.deliverable_subcategory',
                        deliverable_services:'$del_info.deliverable_services',
                        deliverable_systems:'$del_info.deliverable_systems',
                        deliverable_items:'$del_info.deliverable_items',
                        deliverable_main_category:'$del_info.deliverable_main_category',
                        deliverable_sub_category:'$del_info.deliverable_sub_category',
                        deliverable_parameter:'$del_info.deliverable_parameter',
                        deliverable_codes:'$del_info.deliverable_codes',
                        revid:'$del_info.review_info._id',
                        selfqc_marks:'$del_info.review_info.selfqc_marks',
                        peerqc_marks:'$del_info.review_info.peerqc_marks',
                        finalqc_marks:'$del_info.review_info.finalqc_marks'
                    }
                }
            }
        },
        {
            $project:
            {
                _id:'$_id._id',
                project_name:'$_id.project_name',
                created_date:'$_id.created_date',
                created_by:'$_id.created_by',
                project_type:'$_id.project_type',
                project_subtype_info:'$_id.project_subtype_info',
                project_country:'$_id.project_country',
                project_state:'$_id.project_state',
                client_name:'$_id.client_name',
                architect_name:'$_id.architect_name',
                manager_info:'$_id.manager_info',
                leader_info:'$_id.leader_info',
                engineers_info:'$_id.engineers_info',
                rid:'$_id.rid',
                revision_name:'$_id.revision_name',
                project_services:'$_id.project_services',
                project_systems:'$_id.project_systems',
                project_items:'$_id.project_items',
                project_main_category:'$_id.project_main_category',
                project_sub_category:'$_id.project_sub_category',
                project_parameter:'$_id.project_parameter',
                project_codes:'$_id.project_codes',
                deliverable_info:'$deliverable_info'
            }
        },
        { 
            $sort : { _id :1 }
        }
    ], function (err, result) {
        if (err) {
            next(err);
        } 
        else 
        {
            var TeamSize=result[0].manager_info.length+result[0].leader_info.length+result[0].engineers_info.length;
            var delSize=result[0].deliverable_info.length || '0';

            var deliverableArray=[];
            var i=1;
            result[0].deliverable_info.forEach(function(item){
                deliverableArray.push({
                    s_no:i,
                    deliverable_name:item.drawing_title,
                    engineer:item.service_engineer,
                    tl:item.team_leader,
                    status:item.deliverable_status,
                    selfqc:item.selfqc_marks,
                    peerqc:item.peerqc_marks,
                });
                i++;
            });
            
            var deliverableTable=[{
                columns:[{title:"#",dataKey: "s_no"},{title: "Deliverables Name", dataKey: "deliverable_name"},{title: "Engineer", dataKey: "engineer"},{title: "TL", dataKey: "tl"},{title: "Status", dataKey: "status"},{title: "Self QC", dataKey: "selfqc"},{title: "Peer QC", dataKey: "peerqc"}],
                deliverableArray:deliverableArray
            }];

            res.status(201).json({
                project_name:result[0].project_name,
                created_date:result[0].created_date,
                created_by:result[0].created_by || '-',
                project_type:result[0].project_type,
                project_subtype_info:result[0].project_subtype_info,
                project_country:result[0].project_country,
                project_state:result[0].project_state,
                client_name:result[0].client_name || '-',
                architect_name:result[0].architect_name || '-',
                manager_info:result[0].manager_info,
                leader_info:result[0].leader_info,
                engineers_info:result[0].engineers_info,
                rid:result[0].rid,
                revision_name:result[0].revision_name,
                project_services:result[0].project_services,
                project_systems:result[0].project_systems,
                project_items:result[0].project_items,
                project_main_category:result[0].project_main_category,
                project_sub_category:result[0].project_sub_category,
                project_parameter:result[0].project_parameter,
                project_codes:result[0].project_codes,
                deliverableTable:deliverableTable,
                TeamSize:TeamSize,
                delSize:delSize
            });
        }
    });
});

router.get('/qc/getlogic',jwtAuth,function (req, res, next) {
    QC.Logic.findOne({}, function(err, data) {
        res.status(201).json({
            logicId:data._id,
            new_minor: data.new_minor,
            new_major: data.new_major,
            new_cirtical: data.new_cirtical,
            repeat_minor: data.repeat_minor,
            repeat_major: data.repeat_major,
            repeat_cirtical: data.repeat_cirtical
        });
    });
});

router.post('/qc/savelogic',jwtAuth,function (req, res, next) {
    var bulkquery=req.body;
    QC.Logic.findOne({_id:ObjectId(bulkquery.logicId)}, function(err, data) {
        data.new_minor=bulkquery.new_minor;
        data.new_major=bulkquery.new_major;
        data.new_cirtical=bulkquery.new_cirtical;
        data.repeat_minor=bulkquery.repeat_minor;
        data.repeat_major=bulkquery.repeat_major;
        data.repeat_cirtical=bulkquery.repeat_cirtical;
        data.save(function(err, result) { 
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

router.get("/uploadequipment", function(req, res) {
    const ExcelJS = require('exceljs');
    const workbook = new ExcelJS.Workbook();
    var systemList=[];

    workbook.xlsx.readFile('public/equipmentlist.xlsx').then(function() {
        workbook.eachSheet((sheet, id) => {
            sheet.eachRow((row, rowIndex) => {
                if(row.values[1]!=undefined)
                {
                    var sysIndex = systemList.findIndex(x => x.system_name==row.values[1]);
                    if(sysIndex>=0)
                    {
                        if(row.values[2]!=undefined)
                        {
                            var itemIndex = systemList[sysIndex].item_info.findIndex(x => x.item_name==row.values[2]);
                            if(itemIndex>=0)
                            {
                                if(row.values[3]!=undefined)
                                {
                                    var mcIndex = systemList[sysIndex].item_info[itemIndex].main_category_info.findIndex(x => x.main_category_name==row.values[3]);
                                    if(mcIndex>=0)
                                    {
                                        if(row.values[4]!=undefined)
                                        {
                                            var scIndex = systemList[sysIndex].item_info[itemIndex].main_category_info[mcIndex].sub_category_info.findIndex(x => x.sub_category_name==row.values[4]);
                                            if(scIndex>=0)
                                            {   
                                                if(row.values[5]!=undefined)
                                                {
                                                    var paramIndex = systemList[sysIndex].item_info[itemIndex].main_category_info[mcIndex].sub_category_info[scIndex].parameter_info.findIndex(x => x.parameter_name==row.values[5]);
                                                    if(paramIndex<0)
                                                    {
                                                        systemList[sysIndex].item_info[itemIndex].main_category_info[mcIndex].sub_category_info[scIndex].parameter_info.push({
                                                            '_id':new ObjectId(),
                                                            parameter_name:row.values[5]
                                                        });
                                                    }
                                                }
                                            }
                                            else
                                            {
                                                if(row.values[5]!=undefined)
                                                {
                                                    systemList[sysIndex].item_info[itemIndex].main_category_info[mcIndex].sub_category_info.push({
                                                        '_id':new ObjectId(),
                                                        sub_category_name:row.values[4],
                                                        parameter_info:[{
                                                            '_id':new ObjectId(),
                                                            parameter_name:row.values[5]
                                                        }]
                                                    });
                                                }
                                                else if(row.values[5]==undefined)
                                                {
                                                    systemList[sysIndex].item_info[itemIndex].main_category_info[mcIndex].sub_category_info.push({
                                                        '_id':new ObjectId(),
                                                        sub_category_name:row.values[4],
                                                        parameter_info:[]
                                                    });
                                                }
                                            }
                                        }
                                    }
                                    else
                                    {
                                       
                                        if(row.values[5]!=undefined && row.values[4]!=undefined)
                                        {
                                            systemList[sysIndex].item_info[itemIndex].main_category_info.push({
                                                '_id':new ObjectId(),
                                                main_category_name:row.values[3],
                                                sub_category_info:[{
                                                    '_id':new ObjectId(),
                                                    sub_category_name:row.values[4],
                                                    parameter_info:[{
                                                        '_id':new ObjectId(),
                                                        parameter_name:row.values[5]
                                                    }]
                                                }]
                                            });
                                        }
                                        else if(row.values[5]==undefined && row.values[4]!=undefined)
                                        {
                                            systemList[sysIndex].item_info[itemIndex].main_category_info.push({
                                                '_id':new ObjectId(),
                                                main_category_name:row.values[3],
                                                sub_category_info:[{
                                                    '_id':new ObjectId(),
                                                    sub_category_name:row.values[4],
                                                    parameter_info:[]
                                                }]
                                            });
                                        }
                                        else if(row.values[5]==undefined && row.values[4]==undefined)
                                        {
                                            systemList[sysIndex].item_info[itemIndex].main_category_info.push({
                                                '_id':new ObjectId(),
                                                main_category_name:row.values[3],
                                                sub_category_info:[]
                                            });
                                        }
                                    }
                                }
                            }
                            else
                            {
                                if(row.values[5]!=undefined && row.values[4]!=undefined && row.values[3]!=undefined)
                                {
                                    systemList[sysIndex].item_info.push({
                                        '_id':new ObjectId(),
                                        item_name:row.values[2],
                                        main_category_info:[{
                                            '_id':new ObjectId(),
                                            main_category_name:row.values[3],
                                            sub_category_info:[{
                                                '_id':new ObjectId(),
                                                sub_category_name:row.values[4],
                                                parameter_info:[{
                                                    '_id':new ObjectId(),
                                                    parameter_name:row.values[5]
                                                }]
                                            }]
                                        }]
                                    });
                                }
                                else if(row.values[5]==undefined && row.values[4]!=undefined && row.values[3]!=undefined)
                                {
                                    systemList[sysIndex].item_info.push({
                                        '_id':new ObjectId(),
                                        item_name:row.values[2],
                                        main_category_info:[{
                                            '_id':new ObjectId(),
                                            main_category_name:row.values[3],
                                            sub_category_info:[{
                                                '_id':new ObjectId(),
                                                sub_category_name:row.values[4],
                                                parameter_info:[]
                                            }]
                                        }]
                                    });
                                }
                                else if(row.values[5]==undefined && row.values[4]==undefined && row.values[3]!=undefined)
                                {
                                    systemList[sysIndex].item_info.push({
                                        '_id':new ObjectId(),
                                        item_name:row.values[2],
                                        main_category_info:[{
                                            '_id':new ObjectId(),
                                            main_category_name:row.values[3],
                                            sub_category_info:[]
                                        }]
                                    });
                                }
                                else if(row.values[5]==undefined && row.values[4]==undefined && row.values[3]==undefined)
                                {
                                    systemList[sysIndex].item_info.push({
                                        '_id':new ObjectId(),
                                        item_name:row.values[2],
                                        main_category_info:[]
                                    });
                                }
                            }
                        }
                    }
                    else
                    {
                        if(row.values[5]!=undefined && row.values[4]!=undefined && row.values[3]!=undefined && row.values[2]!=undefined)
                        {
                            systemList.push({
                                '_id':new ObjectId(),
                                system_name:row.values[1],
                                item_info:[{
                                    '_id':new ObjectId(),
                                    item_name:row.values[2],
                                    main_category_info:[{
                                        '_id':new ObjectId(),
                                        main_category_name:row.values[3],
                                        sub_category_info:[{
                                            '_id':new ObjectId(),
                                            sub_category_name:row.values[4],
                                            parameter_info:[{
                                                '_id':new ObjectId(),
                                                parameter_name:row.values[5]
                                            }]
                                        }]
                                    }]
                                }]
                            });
                        }
                        else if(row.values[5]==undefined && row.values[4]!=undefined && row.values[3]!=undefined && row.values[2]!=undefined)
                        {
                            systemList.push({
                                '_id':new ObjectId(),
                                system_name:row.values[1],
                                item_info:[{
                                    '_id':new ObjectId(),
                                    item_name:row.values[2],
                                    main_category_info:[{
                                        '_id':new ObjectId(),
                                        main_category_name:row.values[3],
                                        sub_category_info:[{
                                            '_id':new ObjectId(),
                                            sub_category_name:row.values[4],
                                            parameter_info:[]
                                        }]
                                    }]
                                }]
                            });
                        }
                        else if(row.values[5]==undefined && row.values[4]==undefined && row.values[3]!=undefined && row.values[2]!=undefined)
                        {
                            systemList.push({
                                '_id':new ObjectId(),
                                system_name:row.values[1],
                                item_info:[{
                                    '_id':new ObjectId(),
                                    item_name:row.values[2],
                                    main_category_info:[{
                                        '_id':new ObjectId(),
                                        main_category_name:row.values[3],
                                        sub_category_info:[]
                                    }]
                                }]
                            });
                        }
                        else if(row.values[5]==undefined && row.values[4]==undefined && row.values[3]==undefined && row.values[2]!=undefined)
                        {
                            systemList.push({
                                '_id':new ObjectId(),
                                system_name:row.values[1],
                                item_info:[{
                                    '_id':new ObjectId(),
                                    item_name:row.values[2],
                                    main_category_info:[]
                                }]
                            });
                        }
                        else if(row.values[5]==undefined && row.values[4]==undefined && row.values[3]==undefined && row.values[2]==undefined)
                        {
                            systemList.push({
                                '_id':new ObjectId(),
                                system_name:row.values[1],
                                item_info:[]
                            });
                        }
                    }
                }
            });
        });

        var bulk = Thogupu.Service.collection.initializeUnorderedBulkOp();
        bulk.find( { 'service_name': 'ELV'} ).update( { $set: { 'system_info':systemList} } );
        bulk.execute();
        res.json('saved');/* 
        QC.User.findOne({'service_name':'HVAC'}, function(err, data) {
            data.system_info=systemList;
            data.save(function(err, result) { 
                if (err) {
                    return res.status(500).json({
                        title: 'An error occurred',
                        error: err
                    });
                }
                else
                {
                   
                }
            });
        }); */
    });
});

router.get("/uploaddeliverabletags", function(req, res) {
    const ExcelJS = require('exceljs');
    const workbook = new ExcelJS.Workbook();
    var delList=[];

    workbook.xlsx.readFile('public/deliverabletags.xlsx').then(function() {
        workbook.eachSheet((sheet, id) => {
            sheet.eachRow((row, rowIndex) => {
                if(row.values[1]!=undefined)
                {
                    var delIndex = delList.findIndex(x => x.deliverable_name==row.values[1]);
                    if(delIndex>=0)
                    {
                        delList[delIndex].sub_deliverable_info.push({
                            '_id':new ObjectId(),
                            sub_deliverable_name:row.values[2]
                        });
                    }
                    else
                    {
                        delList.push({
                            '_id':new ObjectId(),
                            deliverable_name:row.values[1],
                            sub_deliverable_info:[{
                                '_id':new ObjectId(),
                                sub_deliverable_name:row.values[2]
                            }]
                        });
                    }
                }
            });
        });

        var bulk = Thogupu.Service.collection.initializeUnorderedBulkOp();
        bulk.find( { 'service_name': 'PHE'} ).update( { $set: { 'deliverable_info':delList} } );
        bulk.execute();
        res.json('saved');
    });
});

router.get("/uploadprojecttypetags", function(req, res) {
    const ExcelJS = require('exceljs');
    const workbook = new ExcelJS.Workbook();
    var subTypeList=[];

    workbook.xlsx.readFile('public/projecttypestags.xlsx').then(function() {
        workbook.eachSheet((sheet, id) => {
            sheet.eachRow((row, rowIndex) => {
                if(row.values[1]!=undefined)
                {
                    subTypeList.push({
                        '_id':new ObjectId(),
                        project_sub_type:row.values[1]
                    });
                }
            });
        });

        var bulk = Thogupu.PType.collection.initializeUnorderedBulkOp();
        bulk.find( { 'project_type': 'Residential'} ).update( { $set: { 'sub_type_info':subTypeList} } );
        bulk.execute();
        res.json('saved');
    });
});

router.get("/cleardeliverables", function(req, res) {
    var bulk = QC.Temp.collection.initializeUnorderedBulkOp();
    bulk.find( {} ).update( { $set: { 'deliverable_info':[],'subdeliverable_info':[] } } );
    bulk.execute();
    res.json('saved');
});

router.get("/clearptypes", function(req, res) {
    var bulk = QC.Temp.collection.initializeUnorderedBulkOp();
    bulk.find( {} ).update( { $set: { 'ptype_info':[],'psubtype_info':[] } } );
    bulk.execute();
    res.json('saved');
});

//Get All checkpoints
router.get('/qc/getvpccheckpoints', (req, res, next) => {
    QC.CPoints.find({}, (err, result) => {
        if (err) {
            return res.status(500).json({
                title: 'An error occurred',
                error: err
            })
        } else {
            res.json(result)
        }
    })
})

router.get('/qc/helpmessage/:bulkquery', function (req, res, next){

    var input=JSON.parse(req.params.bulkquery);
    var ticket_number=Math.floor(Math.random()*9000) + 1000;
    console.log(input);
    const small = new Thogupu.Help({ 
        user_mail:input.user_mail,
        help_desc:input.help_desc,
        profile_name:input.profile_name,
        ticket_number:input.ticket_number
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
                to:input.user_mail, // list of receivers
                //to: req.body.email,
                subject: 'Enthiran - VPC MEP', // Subject line
                text: 'Authentication', // plain text body
                html: '<div> <div style="width: 600px;"> <div style="text-align:center;padding-top: 10px;"> <img src="cid:thogupulogo@thogupu.com"> </div> <div style="padding-top: 20px;"> <div style="background-color: #FAFBFF;padding: 10px 20px 50px 20px;"> <div style="text-align: center;font-size: 30px;font-weight: 700;margin-top: 50px;">Help Desk</div> <div style="font-size: 20px;font-weight: 700;text-align: center;margin-top: 10px;">We hear you!</div> <div style="font-size: 16px;font-weight: 400;text-align: center;margin-top: 15px;">Thanks for raising an issue with us. We always strive to make sure that our</div> <div style="font-size: 16px;font-weight: 400;text-align: center;margin-top: 3px;">Application works smoothly without any flaws, and we are pleased to see</div> <div style="font-size: 16px;font-weight: 400;text-align: center;margin-top: 3px;">you actively helping us make our Application more user-friendly.</div> <div style="text-align: center;padding-top: 50px;"> <img src="cid:security@thogupu.com"> </div> <div style="padding: 40px 50px 0px 120px;text-align: center;"> <div style="background-color: #024580;width: 280px; padding: 14px 0px;border-radius: 8px;color: white;font-weight: 700;font-size: 16px;">{{ticket_number}}Your Ticket Number: #0961</div> <div style="font-size: 10px;clear: both;padding: 0px 115px 0px 0px;">We will get back to you within 48 hours.</div> </div> </div> </div> <div style="text-align: center;padding-top: 15px;"> <img src="cid:jblogo@thogupu.com"> </div> <div style="font-size: 12px;text-align: center;padding-top: 10px;">If you have any questions, feel free to message us at info@jupiterbrothers.com</div> <div style="font-size: 12px;text-align: center;padding-top: 10px;font-weight: 700;">Maraneri, Sivakasi, Tamil Nadu, India</div> <div style="display: flex;text-align: center;padding: 10px 0px 0px 223px;"> <a href="https://www.linkedin.com/mwlite/company/jupiterbrothers"> <img src="cid:linkedin@thogupu.com"> </a> <a href="https://m.facebook.com/innovationforaec/?locale2=en_US" style="padding-left: 14px;"> <img src="cid:facebook@thogupu.com"> </a> <a href="https://instagram.com/jupiter.brothers?utm_medium=copy_link" style="padding-left: 14px;"> <img src="cid:instagram@thogupu.com"> </a> <a href="https://twitter.com/jupiterbrothers" style="padding-left: 14px;"> <img src="cid:twitter@thogupu.com"> </a> <a href="https://www.youtube.com/channel/UCn83bZm06GeV8r3OBjKYZ4Q/featured" style="padding-left: 14px;"> <img src="cid:youtube@thogupu.com"> </a> </div> <div style="text-align: center;font-size: 12px;padding-top: 10px;">Terms of use | Privacy Policy</div> <div style="padding-top: 10px;"> <div style="background-color: #DB053D;color: white;font-size: 12px;text-align: center;padding: 5px 0px 5px 0px;">All rights reserved © Jupiter Brothers Data Center Pvt. Ltd.,</div> </div> </div> </div>', // html body
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


router.get('/thogupu/userprofile/:userprofile', (req, res) => {

    var input = JSON.parse(req.params.userprofile);
    console.log(input)
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
        data.file_path=input.file_path;
        data.profile_from=input.profile_from;
        
        
    
    data.save(function(err, result) { 
        if (err) {
            return res.status(500).json({
                title: 'An error occurred',
                error: err
              
            });
        }
        else
        {
            res.json(result)
           console.log(result)
        
        }
    });

});
 
});

// add new check point


router.get('/qc/mangerAssign/:pid/:assign_manager/:permit_manager',jwtAuth, function (req, res, next) {
    QC.Project.findOne({"_id":{ $eq: ObjectId(req.params.pid) }},function(err, data){ 
       

        data.permit_manager=req.params.permit_manager;

        data.team_info.forEach(function(item){
            if(item.user_name==req.params.assign_manager)
            {
                data.manager_info.push({
                    user_name:item.user_name,
                    user_id:item.user_id,
                    email_id:item.email_id,
                    profile_img:item.profile_img,
                    user_role:item.user_role,
                    user_status:item.user_status,
                    designation:item.designation
                });
            }
        });
        data.save(function(err, result) { 
            if (err) {
                return res.status(500).json({
                    title: 'Msg saved',
                    error: err
                });
            }
            else
            {
                res.json(result)
            }
        });
    });
});

module.exports = router;