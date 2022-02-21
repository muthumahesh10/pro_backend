var express = require('express');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var router = express.Router();
var mongoose = require ('mongoose');
var ObjectId=require('mongodb').ObjectID;
var VAV = require('../models/vav_schema'); 


var moment=require('moment');
var jwt = require('jsonwebtoken');
const secret_key='aus@1208';
const nodemailer = require('nodemailer');
router.use(session({secret:'meantext',resave:true,saveUninitialized:true}));  
router.use(cookieParser());
var bcrypt = require('bcrypt');
var salt = bcrypt.genSaltSync(10);
var fs = require('fs');
eval(fs.readFileSync('routes/unit.js')+'');

let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // secure:true for port 465, secure:false for port 587
    auth: {
        user: 'innowellgroup@gmail.com',
        pass: 'yrjbioaaayjxjncz'
    }
});


router.get('/vav/getvavunit/:vunit', function (req, res, next) {
    VAV.Vavunit.findOne({unit_type:req.params.vunit}, function(err, data) {
        res.status(201).json({
            airflow_unit:data.airflow_unit,
            pressure_unit:data.pressure_unit,
            inlet_unit:data.inlet_unit,
            outlet_unit:data.outlet_unit,
            casing_unit:data.casing_unit,
            insulation_unit:data.insulation_unit,
            overall_unit:data.overall_unit,
            weight_unit:data.weight_unit,
            power_unit:data.power_unit,
            noise_unit:data.noise_unit
        });
    });
});

router.post('/vav/savevavunit', function (req, res, next) {
    var inputData=req.body;
    VAV.Project.findById(ObjectId(inputData.pid),function(err, data){
        data.input_unit=inputData.input_unit;
        data.output_unit=inputData.output_unit;
        data.airflow_unit=inputData.airflow_unit;
        data.inletpressure_unit=inputData.inletpressure_unit;
        data.pressuredrop_unit=inputData.pressuredrop_unit;
        data.vavsize_unit=inputData.vavsize_unit;
        data.casing_unit=inputData.casing_unit;
        data.insulation_unit=inputData.insulation_unit;
        data.weight_unit=inputData.weight_unit;
        data.power_unit=inputData.power_unit;
        data.noise_unit=inputData.noise_unit;
        data.pressuredrop_from=inputData.pressuredrop_from;
        data.vavsizeunit_from=inputData.vavsizeunit_from;
        data.casingunit_from=inputData.casingunit_from;
        data.insulationunit_from=inputData.insulationunit_from;
        data.weightunit_from=inputData.weightunit_from;
        data.powerunit_from=inputData.powerunit_from;
        data.noiseunit_from=inputData.noiseunit_from;

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

router.get('/vav/getbuildinginfo/:pid', function (req, res, next) {
 
    VAV.Project.aggregate([
        { $match:{"_id": ObjectId(req.params.pid)}},  
        { $unwind:'$building_info' },
        {
            $group:
            {
                _id: {'_id':'$building_info.building_name'}   
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
            $sort : { name : 1}
        }
      ], function (err, result) {
          if (err) {
              next(err);
          } 
          else 
          {
            VAV.Project.findById(ObjectId(req.params.pid),function(err, data){
                res.status(201).json({
                    project_name:data.project_name,
                    project_id:data.project_id,
                    total_vav:data.total_vav,
                    input_unit:data.input_unit,
                    output_unit:data.output_unit,
                    airflow_unit:data.airflow_unit,
                    inletpressure_unit:data.inletpressure_unit,
                    pressuredrop_unit:data.pressuredrop_unit,
                    vavsize_unit:data.vavsize_unit,
                    casing_unit:data.casing_unit,
                    insulation_unit:data.insulation_unit,
                    weight_unit:data.weight_unit,
                    power_unit:data.power_unit,
                    noise_unit:data.noise_unit,
                    pressuredrop_from:data.pressuredrop_from,
                    vavsizeunit_from:data.vavsizeunit_from,
                    casingunit_from:data.casingunit_from,
                    insulationunit_from:data.insulationunit_from,
                    weightunit_from:data.weightunit_from,
                    powerunit_from:data.powerunit_from,
                    noiseunit_from:data.noiseunit_from,
                    building_info:result
                });
            });
          }
    });
});

router.get('/vav/getfloorinfo/:pid/:bname', function (req, res, next) {
    VAV.Project.aggregate([
        { $match:{"_id": ObjectId(req.params.pid)}},  
        { $unwind:'$building_info' },
        { $match:{"building_info.building_name": req.params.bname }},  
        {
            $group:
            {
                _id: {'_id':'$building_info.floor_name'}   
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
            $sort : { name : 1}
        }
      ], function (err, result) {
          if (err) {
              next(err);
          } else {
              res.json(result);
          }
    });
});

router.get('/vav/getroominfo/:pid/:bname/:fname', function (req, res, next) {
    VAV.Project.aggregate([
        { $match:{"_id": ObjectId(req.params.pid)}},  
        { $unwind:'$building_info' },
        { $match: { $and :[{"building_info.building_name":req.params.bname},{"building_info.floor_name":req.params.fname}] } },
        {
            $group:
            {
                _id: {'_id':'$building_info.room_tag'}   
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
            $sort : { name : 1}
        }
      ], function (err, result) {
          if (err) {
              next(err);
          } else {
              res.json(result);
          }
    });
});

router.get('/vav/getvavcatalogue/:mname', function (req, res, next) {
    VAV.Catalogue.findOne({catalogue_name:req.params.mname}, function(err, data) {
        res.status(201).json({
            dimension_info:data.dimension_info,
            radiated_info:data.radiated_info,
            discharge_info:data.discharge_info
        });
    });
}); 

router.post('/vav/savevavoutput', function (req, res, next) {
   
    var inputData=req.body;
    
    VAV.Project.findById(ObjectId(inputData.pid),function(err, data){
        
        data.total_vav=data.total_vav+parseInt(inputData.noof_vav);
        
        if(inputData.edit_building==false)
        {
            var index = data.building_info.findIndex(x => x.building_name==inputData.building_name && x.floor_name==inputData.floor_name && x.room_tag==inputData.room_name);
        
            var bid=data.building_info[index]._id;
            var t=data.building_info.id(ObjectId(bid));
         
            t.vav_category=inputData.vav_category;
            t.manufacture_name=inputData.manufacture_name;
            t.vav_tag=inputData.vav_tag;
            t.airflow_rate=inputData.airflow_rate;
            t.min_airflow=inputData.min_airflow;
            t.inlet_pressure=inputData.inlet_pressure;
            t.noof_vav=inputData.noof_vav;
            t.vav_type=inputData.vav_type;
            t.insulation_type=inputData.insulation_type;
            t.max_airflow=inputData.max_airflow;
            t.design_airflow=inputData.design_airflow;
            t.inlet_mm=inputData.inlet_mm;
            t.inlet_inch=inputData.inlet_inch;
            t.pressuredrop_pa=inputData.pressuredrop_pa;
            t.pressuredrop_mm=inputData.pressuredrop_mm;
            t.pressuredrop_inch=inputData.pressuredrop_inch;
            t.length_inch=inputData.length_inch;
            t.height_inch=inputData.height_inch;
            t.width_inch=inputData.width_inch;
            t.length_mm=inputData.length_mm;
            t.height_mm=inputData.height_mm;
            t.width_mm=inputData.width_mm;
            t.overlength_mm=inputData.overlength_mm,
            t.overheight_mm=inputData.overheight_mm,
            t.overwidth_mm=inputData.overwidth_mm,
            t.overlength_inch=inputData.overlength_inch,
            t.overheight_inch=inputData.overheight_inch,
            t.overwidth_inch=inputData.overwidth_inch,
            t.radiated_sound=inputData.radiated_sound;
            t.discharge_sound=inputData.discharge_sound;
        }
        else if(inputData.edit_building==true)
        {
            data.building_info.push({
                '_id':new ObjectId(),
                vav_category:inputData.vav_category,
                manufacture_name:inputData.manufacture_name,
                building_name:inputData.building_name,
                floor_name:inputData.floor_name,
                room_tag:inputData.room_name,
                vav_tag:inputData.vav_tag,
                airflow_rate:inputData.airflow_rate,
                min_airflow:inputData.min_airflow,
                inlet_pressure:inputData.inlet_pressure,
                noof_vav:inputData.noof_vav,
                vav_type:inputData.vav_type,
                insulation_type:inputData.insulation_type,
                max_airflow:inputData.max_airflow,
                design_airflow:inputData.design_airflow,
                inlet_mm:inputData.inlet_mm,
                inlet_inch:inputData.inlet_inch,
                pressuredrop_pa:inputData.pressuredrop_pa,
                pressuredrop_mm:inputData.pressuredrop_mm,
                pressuredrop_inch:inputData.pressuredrop_inch,
                length_inch:inputData.length_inch,
                height_inch:inputData.height_inch,
                width_inch:inputData.width_inch,
                length_mm:inputData.length_mm,
                height_mm:inputData.height_mm,
                width_mm:inputData.width_mm,
                overlength_mm:inputData.overlength_mm,
                overheight_mm:inputData.overheight_mm,
                overwidth_mm:inputData.overwidth_mm,
                overlength_inch:inputData.overlength_inch,
                overheight_inch:inputData.overheight_inch,
                overwidth_inch:inputData.overwidth_inch,
                radiated_sound:inputData.radiated_sound,
                discharge_sound:inputData.discharge_sound
            }); 
        }
        
        data.save(function(err, result) { 
            console.log(err);
            if (err) {
                return res.status(500).json({
                    title: 'An error occurred',
                    error: err
                });
            }
            else
            {
                res.status(201).json({
                    total_vav:data.total_vav
                });
            }
        });
    });

  /*  var bulk = VAV.Project.collection.initializeUnorderedBulkOp();
    var conditionArray=[{"_id": ObjectId('60dc5f26971a2973d8fe21c7')},{"building_info.building_name": inputData.building_name},{"building_info.floor_name": inputData.floor_name},{"building_info.room_tag": inputData.room_name}];

   

     var arrayTosave={
        "building_info.$.casing_type" : inputData.casing_type,
        "building_info.$.airflow_rate" :  inputData.airflow_rate,
        "building_info.$.airflow_unit" :  inputData.airflow_unit,
        "building_info.$.pressure_change" :  inputData.pressure_change,
        "building_info.$.min_airflow" :  inputData.min_airflow,
        "building_info.$.nc_pressure" :  inputData.nc_pressure,
        "building_info.$.noof_vav" :  inputData.noof_vav,
        "building_info.$.vav_type" :  inputData.vav_type,
        "building_info.$.manufacture_name" :  inputData.manufacture_name,
        "building_info.$.inlet_inch" :  inputData.inlet_inch,
        "building_info.$.inlet_mm" :  inputData.inlet_mm,
        "building_info.$.length_mm" :  inputData.length_mm,
        "building_info.$.height_mm" :  inputData.height_mm,
        "building_info.$.width_mm" :  inputData.width_mm,
        "building_info.$.design_airflow" :  inputData.design_airflow,
        "building_info.$.radiated_sound" :  inputData.radiated_sound,
        "building_info.$.discharge_sound" :  inputData.discharge_sound,
        "building_info.$.insulation_type" :  inputData.insulation_type
    }
    bulk.find( { $and:conditionArray } ).update( { $set: arrayTosave } );
    bulk.execute(function(err,result) {
        console.log(err);
        console.log(result);
        res.json('saved');
    }); */
});

router.get('/vav/getvavsummary/:bname/:fname', function (req, res, next) {
    var aggregateArray=[
        { $match:{"_id": ObjectId('60dc5f26971a2973d8fe21c7')}},  
        { $unwind:'$building_info' }
    ];

    if(req.params.bname!='All' && req.params.fname!='All')
    {
        aggregateArray.push({ $match: { $and :[{"building_info.building_name":req.params.bname},{"building_info.floor_name":req.params.fname}] } });
    }
    else if(req.params.bname!='All')
    {
        aggregateArray.push({ $match:{"building_info.building_name":req.params.bname} })
    }

    aggregateArray.push({
        $group:
        {
            _id: {'_id':'$building_info._id','building_name':'$building_info.building_name','floor_name':'$building_info.floor_name','room_tag':'$building_info.room_tag','vav_tag':'$building_info.vav_tag','vav_type':'$building_info.vav_type','airflow_rate':'$building_info.airflow_rate','airflow_unit':'$building_info.airflow_unit','inlet_mm':'$building_info.inlet_mm'}   
        }
    },
    {
        $project:
        {
            _id:'$_id._id',
            building_name:'$_id.building_name',
            floor_name:'$_id.floor_name',
            room_tag:'$_id.room_tag',
            vav_tag:'$_id.vav_tag',
            vav_type:'$_id.vav_type',
            airflow_rate:'$_id.airflow_rate',
            airflow_unit:'$_id.airflow_unit',
            inlet_mm:'$_id.inlet_mm'
        }
    },
    { 
        $sort : { _id : 1}
    });

    VAV.Project.aggregate(aggregateArray, function (err, result) {
        if (err) {
            next(err);
        } else {
            res.json(result);
        }
    });
});


router.get('/vav/getvavreport/:pid/:bname/:fname', function (req, res, next) {
    var summaryArray=[
        { $match:{"_id": ObjectId(req.params.pid)}},  
        { $unwind:'$building_info' }
    ];
    var scheduleArray=[
        { $match:{"_id": ObjectId(req.params.pid)}},  
        { $unwind:'$building_info' }
    ];
    
    if(req.params.bname!='All' && req.params.fname!='All')
    {
        summaryArray.push({ $match: { $and :[{"building_info.building_name":req.params.bname},{"building_info.floor_name":req.params.fname}] } });
        summaryArray.push({ $match: { $and :[{"building_info.building_name":req.params.bname},{"building_info.floor_name":req.params.fname}] } });
    }
    else if(req.params.bname!='All')
    {
        scheduleArray.push({ $match:{"building_info.building_name":req.params.bname} });
        scheduleArray.push({ $match:{"building_info.building_name":req.params.bname} });
    }

    summaryArray.push({
        $group:
        {
            _id: {'_id':'$building_info._id','building_name':'$building_info.building_name','floor_name':'$building_info.floor_name','room_tag':'$building_info.room_tag','vav_tag':'$building_info.vav_tag','vav_type':'$building_info.vav_type','design_airflow':'$building_info.design_airflow','noof_vav':'$building_info.noof_vav','inlet_mm':'$building_info.inlet_mm','inlet_inch':'$building_info.inlet_inch','length_inch':'$building_info.length_inch','height_inch':'$building_info.height_inch','width_inch':'$building_info.width_inch','length_mm':'$building_info.length_mm','height_mm':'$building_info.height_mm','width_mm':'$building_info.width_mm','overlength_inch':'$building_info.overlength_inch','overheight_inch':'$building_info.overheight_inch','overwidth_inch':'$building_info.overwidth_inch','overlength_mm':'$building_info.overlength_mm','overheight_mm':'$building_info.overheight_mm','overwidth_mm':'$building_info.overwidth_mm','insulation_type':'$building_info.insulation_type','radiated_sound':'$building_info.radiated_sound','discharge_sound':'$building_info.discharge_sound','min_airflow':'$building_info.min_airflow','airflow_rate':'$building_info.airflow_rate','pressuredrop_pa':'$building_info.pressuredrop_pa','pressuredrop_mm':'$building_info.pressuredrop_mm','pressuredrop_inch':'$building_info.pressuredrop_inch'}   
        }
    },
    {
        $project:
        {
            _id:'$_id._id',
            building_name:'$_id.building_name',
            floor_name:'$_id.floor_name',
            room_tag:'$_id.room_tag',
            vav_tag:'$_id.vav_tag',
            vav_type:'$_id.vav_type',
            design_airflow:'$_id.design_airflow',
            noof_vav:'$_id.noof_vav',
            inlet_mm:'$_id.inlet_mm',
            inlet_inch:'$_id.inlet_inch',
            length_inch:'$_id.length_inch',
            height_inch:'$_id.height_inch',
            width_inch:'$_id.width_inch',
            length_mm:'$_id.length_mm',
            height_mm:'$_id.height_mm',
            width_mm:'$_id.width_mm',
            overlength_inch:'$_id.overlength_inch',
            overheight_inch:'$_id.overheight_inch',
            overwidth_inch:'$_id.overwidth_inch',
            overlength_mm:'$_id.overlength_mm',
            overheight_mm:'$_id.overheight_mm',
            overwidth_mm:'$_id.overwidth_mm',
            insulation_type:'$_id.insulation_type',
            radiated_sound:'$_id.radiated_sound',
            discharge_sound:'$_id.discharge_sound',
            min_airflow:'$_id.min_airflow',
            airflow_rate:'$_id.airflow_rate',
            pressuredrop_pa:'$_id.pressuredrop_pa',
            pressuredrop_mm:'$_id.pressuredrop_mm',
            pressuredrop_inch:'$_id.pressuredrop_inch'
        }
    },
    { 
        $sort : { _id : 1}
    });

    scheduleArray.push({
        $group:
        {
            _id: {'_id':'$building_info.building_name','floor_name':'$building_info.floor_name'},   
            total_vav: { "$sum": '$building_info.noof_vav' },
        }
    },
    {
        $project:
        {
            _id:0,
            building_name:'$_id._id',
            floor_name:'$_id.floor_name',
            total_vav:'$total_vav'
        }
    },
    { 
        $sort : { building_name : 1}
    });

    VAV.Project.aggregate(summaryArray, function (err, result1) {
        if (err) {
            next(err);
        } 
        else 
        {
            VAV.Project.aggregate(scheduleArray, function (err, result2) {
                if (err) {
                    next(err);
                } 
                else 
                {
                    VAV.Project.aggregate([
                        { $match:{"_id": ObjectId(req.params.pid)}},  
                        { $unwind:'$building_info' },
                        {
                            $group:
                            {
                                _id: {'_id':'$building_info.building_name'}   
                            }
                        },
                        {
                            $project:
                            {
                                _id:0,
                                building_name:'$_id._id'
                            }
                        },
                        { 
                            $sort : { building_name : 1}
                        }
                    ], function (err, result3) {
                        if (err) {
                            next(err);
                        } 
                        else 
                        {
                            VAV.Project.findById(ObjectId(req.params.pid),function(err, data){
                               
                                res.status(201).json({
                                    summary:result1,
                                    schedule:result2,
                                    building_info:result3,
                                    project_name:data.project_name,
                                    project_id:data.project_id,
                                    airflow_unit:data.airflow_unit,
                                    vavsize_unit:data.vavsize_unit,
                                    pressuredrop_unit:data.pressuredrop_unit,
                                    noise_unit:data.noise_unit,
                                    insulation_unit:data.insulation_unit,
                                    power_unit:data.power_unit
                                });
                            });
                        }
                    });
                }
            });
        }
    });
});

router.get('/vav/catalogueupdate', function (req, res, next) {
    const ExcelJS = require('exceljs');
    const workbook = new ExcelJS.Workbook();
    var itemlist=[];
    workbook.xlsx.readFile('public/catalogue/catalogue.xlsx').then(function() {
        workbook.eachSheet((sheet, id) => {
            sheet.eachRow((row, rowIndex) => {
            
                itemlist.push({
                    '_id':new ObjectId(),
                    inlet_inch:row.values[1],
                    inlet_mm:row.values[2],
                    length_mm:row.values[3],
                    width_mm:row.values[4],
                    height_mm:row.values[5],
                    max_cfm:row.values[6],
                    min_cfm:row.values[7],
                    overall_width:row.values[8],
                    overall_height:row.values[9],
                    overall_length:row.values[10]
                });    
                 /*   itemlist.push({
                    '_id':new ObjectId(),
                    inlet_inch:row.values[1],
                    inlet_mm:row.values[2],
                    min_pressure:row.values[3],
                    cfm_value:row.values[4],
                    halfinch_pressure:row.values[5],
                    oneinch_pressure:row.values[6],
                    onehalfinch_pressure:row.values[7],
                    //secondinch_pressure:row.values[8],
                    threeinch_pressure:row.values[8]
                });     */
            });
        });
        VAV.Catalogue.findOne({catalogue_name:'Syncro Concealed Oval'}, function(err, data) {

            data.dimension_info=itemlist;

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
});



module.exports = router;