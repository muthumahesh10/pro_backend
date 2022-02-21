var POC = require('../models/poc_schema'); 
var WDC = require('../models/wdc_schema'); 

var express = require('express');
var router = express.Router();
var ObjectId=require('mongodb').ObjectID;

router.get('/wdc/getbuildingdetails/:pid', function (req, res, next) {
    WDC.Project.aggregate([
        { $match:{"_id": ObjectId(req.params.pid)}},  
        { $unwind:'$building_info' },
        {
            $group:
            {
                _id: {'_id':'$building_info._id','building_name':'$building_info.building_name'}
            }
        },
        {
            $project:
            {
                _id:'$_id._id',
                building_name:'$_id.building_name'
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
            WDC.Project.findById(ObjectId(req.params.pid),function(err, data){
                res.status(201).json({
                    msg:'saved',
                    buildingList:result,
                    project_name:data.project_name,
                    project_id:data.project_id,
                    wdinput_unit:data.wdinput_unit,
                    landscapinginput_unit:data.landscapinginput_unit,
                    wdoutput_unit:data.wdoutput_unit,
                 });
            });
        }
    });
});

router.get('/wdc/getbuildingtypes', function (req, res, next) {

    POC.BTypes.aggregate([
        { $unwind:'$space_info' },
        {
            $group:
            {
                _id: {'_id':'$space_info.main_space','domestic_water':'$space_info.domestic_water','flushing_water':'$space_info.flushing_water','waterdemand_info':'$space_info.waterdemand_info'}
            }
        },
        {
            $project:
            {
                _id:0,
                main_space:'$_id._id',
                domestic_water:'$_id.domestic_water',
                flushing_water:'$_id.flushing_water',
                waterdemand_info:'$_id.waterdemand_info'
            }
        },
        { 
            $sort : { main_space : 1}
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

router.post('/wdc/savewdoutput', function (req, res, next) {
   
    var inputData=req.body;
    WDC.Project.findById(ObjectId(inputData.pid),function(err, data){

        if(inputData.edit_building==false)
        {
            var index = data.building_info.findIndex(x => x.building_name==inputData.building_name);
        
            var bid=data.building_info[index]._id;
            var t=data.building_info.id(ObjectId(bid));

            t.main_space=inputData.selectedMainSpace;
            t.sub_space=inputData.selectedSubSpace;
            t.noof_occupants=inputData.noof_occupants;
            t.noof_shift=inputData.noof_shift;
            t.shift_hours=inputData.shift_hours;
            t.process_cooling=inputData.process_cooling;
            t.utility_cooling=inputData.utility_cooling;
            t.chiller_water=inputData.chiller_water;
            t.boiler_water=inputData.boiler_water;
            t.process_water=inputData.process_water;
            t.coldwater_perh=inputData.coldwater_perh;
            t.drinkwaterro_perh=inputData.drinkwaterro_perh;
            t.reverse_osmosis=inputData.reverse_osmosis;
            t.drinkwater_perh=inputData.drinkwater_perh;
            t.roreject_perh=inputData.roreject_perh;
            t.flushwater_perh=inputData.flushwater_perh;
            t.landscape_area=inputData.landscape_area;
            t.landscape_water=inputData.landscape_water;
            t.cold_demand=inputData.cold_demand;
            t.drink_demand=inputData.drink_demand;
            t.rejection_demand=inputData.rejection_demand;
            t.raw_demand=inputData.raw_demand;
            t.flush_demand=inputData.flush_demand;
            t.landscape_demand=inputData.landscape_demand;
            t.recycle_demand=inputData.recycle_demand;
            t.coldwater_mt=inputData.coldwater_mt;
            t.coldwater_cm=inputData.coldwater_cm;
            t.coldwater_mm=inputData.coldwater_mm;
            t.coldwater_kl=inputData.coldwater_kl;
            t.coldwater_lt=inputData.coldwater_lt;
            t.coldwater_ml=inputData.coldwater_ml;
            t.coldwater_gal=inputData.coldwater_gal;
            t.coldwater_ft=inputData.coldwater_ft;
            t.drinkingwater_mt=inputData.drinkingwater_mt;
            t.drinkingwater_cm=inputData.drinkingwater_cm;
            t.drinkingwater_mm=inputData.drinkingwater_mm;
            t.drinkingwater_kl=inputData.drinkingwater_kl;
            t.drinkingwater_lt=inputData.drinkingwater_lt;
            t.drinkingwater_ml=inputData.drinkingwater_ml;
            t.drinkingwater_gal=inputData.drinkingwater_gal;
            t.drinkingwater_ft=inputData.drinkingwater_ft;
            t.rawwater_mt=inputData.rawwater_mt;
            t.rawwater_cm=inputData.rawwater_cm;
            t.rawwater_mm=inputData.rawwater_mm;
            t.rawwater_kl=inputData.rawwater_kl;
            t.rawwater_lt=inputData.rawwater_lt;
            t.rawwater_ml=inputData.rawwater_ml;
            t.rawwater_gal=inputData.rawwater_gal;
            t.rawwater_ft=inputData.rawwater_ft;
            t.flushwater_mt=inputData.flushwater_mt;
            t.flushwater_cm=inputData.flushwater_cm;
            t.flushwater_mm=inputData.flushwater_mm;
            t.flushwater_kl=inputData.flushwater_kl;
            t.flushwater_lt=inputData.flushwater_lt;
            t.flushwater_ml=inputData.flushwater_ml;
            t.flushwater_gal=inputData.flushwater_gal;
            t.flushwater_ft=inputData.flushwater_ft;
            t.landscapingwater_mt=inputData.landscapingwater_mt;
            t.landscapingwater_cm=inputData.landscapingwater_cm;
            t.landscapingwater_mm=inputData.landscapingwater_mm;
            t.landscapingwater_kl=inputData.landscapingwater_kl;
            t.landscapingwater_lt=inputData.landscapingwater_lt;
            t.landscapingwater_ml=inputData.landscapingwater_ml;
            t.landscapingwater_gal=inputData.landscapingwater_gal;
            t.landscapingwater_ft=inputData.landscapingwater_ft;
            t.recyclewater_mt=inputData.recyclewater_mt;
            t.recylewater_cm=inputData.recylewater_cm;
            t.recyclewater_mm=inputData.recyclewater_mm;
            t.recyclewater_kl=inputData.recyclewater_kl;
            t.recyclewater_lt=inputData.recyclewater_lt;
            t.recyclewater_ml=inputData.recyclewater_ml;
            t.recyclewater_gal=inputData.recyclewater_gal;
            t.recyclewater_ft=inputData.recyclewater_ft;

        }
        else if(inputData.edit_building==true)
        {
            var index = data.building_info.findIndex(x => x.building_name==inputData.building_name);
            if(index<0)
            {
                data.building_info.push({
                    '_id':new ObjectId(),
                    building_name:inputData.building_name,
                    main_space:inputData.selectedMainSpace,
                    sub_space:inputData.selectedSubSpace,
                    noof_occupants:inputData.noof_occupants,
                    noof_shift:inputData.noof_shift,
                    shift_hours:inputData.shift_hours,
                    process_cooling:inputData.process_cooling,
                    utility_cooling:inputData.utility_cooling,
                    chiller_water:inputData.chiller_water,
                    boiler_water:inputData.boiler_water,
                    process_water:inputData.process_water,
                    coldwater_perh:inputData.coldwater_perh,
                    drinkwaterro_perh:inputData.drinkwaterro_perh,
                    reverse_osmosis:inputData.reverse_osmosis,
                    drinkwater_perh:inputData.drinkwater_perh,
                    roreject_perh:inputData.roreject_perh,
                    flushwater_perh:inputData.flushwater_perh,
                    landscape_area:inputData.landscape_area,
                    landscape_water:inputData.landscape_water,
                    cold_demand:inputData.cold_demand,
                    drink_demand:inputData.drink_demand,
                    rejection_demand:inputData.rejection_demand,
                    raw_demand:inputData.raw_demand,
                    flush_demand:inputData.flush_demand,
                    landscape_demand:inputData.landscape_demand,
                    recycle_demand:inputData.recycle_demand,
                    coldwater_mt:inputData.coldwater_mt,
                    coldwater_cm:inputData.coldwater_cm,
                    coldwater_mm:inputData.coldwater_mm,
                    coldwater_kl:inputData.coldwater_kl,
                    coldwater_lt:inputData.coldwater_lt,
                    coldwater_ml:inputData.coldwater_ml,
                    coldwater_gal:inputData.coldwater_gal,
                    coldwater_ft:inputData.coldwater_ft,
                    drinkingwater_mt:inputData.drinkingwater_mt,
                    drinkingwater_cm:inputData.drinkingwater_cm,
                    drinkingwater_mm:inputData.drinkingwater_mm,
                    drinkingwater_kl:inputData.drinkingwater_kl,
                    drinkingwater_lt:inputData.drinkingwater_lt,
                    drinkingwater_ml:inputData.drinkingwater_ml,
                    drinkingwater_gal:inputData.drinkingwater_gal,
                    drinkingwater_ft:inputData.drinkingwater_ft,
                    rawwater_mt:inputData.rawwater_mt,
                    rawwater_cm:inputData.rawwater_cm,
                    rawwater_mm:inputData.rawwater_mm,
                    rawwater_kl:inputData.rawwater_kl,
                    rawwater_lt:inputData.rawwater_lt,
                    rawwater_ml:inputData.rawwater_ml,
                    rawwater_gal:inputData.rawwater_gal,
                    rawwater_ft:inputData.rawwater_ft,
                    flushwater_mt:inputData.flushwater_mt,
                    flushwater_cm:inputData.flushwater_cm,
                    flushwater_mm:inputData.flushwater_mm,
                    flushwater_kl:inputData.flushwater_kl,
                    flushwater_lt:inputData.flushwater_lt,
                    flushwater_ml:inputData.flushwater_ml,
                    flushwater_gal:inputData.flushwater_gal,
                    flushwater_ft:inputData.flushwater_ft,
                    landscapingwater_mt:inputData.landscapingwater_mt,
                    landscapingwater_cm:inputData.landscapingwater_cm,
                    landscapingwater_mm:inputData.landscapingwater_mm,
                    landscapingwater_kl:inputData.landscapingwater_kl,
                    landscapingwater_lt:inputData.landscapingwater_lt,
                    landscapingwater_ml:inputData.landscapingwater_ml,
                    landscapingwater_gal:inputData.landscapingwater_gal,
                    landscapingwater_ft:inputData.landscapingwater_ft,
                    recyclewater_mt:inputData.recyclewater_mt,
                    recylewater_cm:inputData.recylewater_cm,
                    recyclewater_mm:inputData.recyclewater_mm,
                    recyclewater_kl:inputData.recyclewater_kl,
                    recyclewater_lt:inputData.recyclewater_lt,
                    recyclewater_ml:inputData.recyclewater_ml,
                    recyclewater_gal:inputData.recyclewater_gal,
                    recyclewater_ft:inputData.recyclewater_ft
                }); 
            }
            else
            {
                var bid=data.building_info[index]._id;
                var t=data.building_info.id(ObjectId(bid));

                t.main_space=inputData.selectedMainSpace;
                t.sub_space=inputData.selectedSubSpace;
                t.noof_occupants=inputData.noof_occupants;
                t.noof_shift=inputData.noof_shift;
                t.shift_hours=inputData.shift_hours;
                t.process_cooling=inputData.process_cooling;
                t.utility_cooling=inputData.utility_cooling;
                t.chiller_water=inputData.chiller_water;
                t.boiler_water=inputData.boiler_water;
                t.process_water=inputData.process_water;
                t.coldwater_perh=inputData.coldwater_perh;
                t.drinkwaterro_perh=inputData.drinkwaterro_perh;
                t.reverse_osmosis=inputData.reverse_osmosis;
                t.drinkwater_perh=inputData.drinkwater_perh;
                t.roreject_perh=inputData.roreject_perh;
                t.flushwater_perh=inputData.flushwater_perh;
                t.landscape_area=inputData.landscape_area;
                t.landscape_water=inputData.landscape_water;
                t.cold_demand=inputData.cold_demand;
                t.drink_demand=inputData.drink_demand;
                t.rejection_demand=inputData.rejection_demand;
                t.raw_demand=inputData.raw_demand;
                t.flush_demand=inputData.flush_demand;
                t.landscape_demand=inputData.landscape_demand;
                t.recycle_demand=inputData.recycle_demand;
                t.coldwater_mt=inputData.coldwater_mt;
                t.coldwater_cm=inputData.coldwater_cm;
                t.coldwater_mm=inputData.coldwater_mm;
                t.coldwater_kl=inputData.coldwater_kl;
                t.coldwater_lt=inputData.coldwater_lt;
                t.coldwater_ml=inputData.coldwater_ml;
                t.coldwater_gal=inputData.coldwater_gal;
                t.coldwater_ft=inputData.coldwater_ft;
                t.drinkingwater_mt=inputData.drinkingwater_mt;
                t.drinkingwater_cm=inputData.drinkingwater_cm;
                t.drinkingwater_mm=inputData.drinkingwater_mm;
                t.drinkingwater_kl=inputData.drinkingwater_kl;
                t.drinkingwater_lt=inputData.drinkingwater_lt;
                t.drinkingwater_ml=inputData.drinkingwater_ml;
                t.drinkingwater_gal=inputData.drinkingwater_gal;
                t.drinkingwater_ft=inputData.drinkingwater_ft;
                t.rawwater_mt=inputData.rawwater_mt;
                t.rawwater_cm=inputData.rawwater_cm;
                t.rawwater_mm=inputData.rawwater_mm;
                t.rawwater_kl=inputData.rawwater_kl;
                t.rawwater_lt=inputData.rawwater_lt;
                t.rawwater_ml=inputData.rawwater_ml;
                t.rawwater_gal=inputData.rawwater_gal;
                t.rawwater_ft=inputData.rawwater_ft;
                t.flushwater_mt=inputData.flushwater_mt;
                t.flushwater_cm=inputData.flushwater_cm;
                t.flushwater_mm=inputData.flushwater_mm;
                t.flushwater_kl=inputData.flushwater_kl;
                t.flushwater_lt=inputData.flushwater_lt;
                t.flushwater_ml=inputData.flushwater_ml;
                t.flushwater_gal=inputData.flushwater_gal;
                t.flushwater_ft=inputData.flushwater_ft;
                t.landscapingwater_mt=inputData.landscapingwater_mt;
                t.landscapingwater_cm=inputData.landscapingwater_cm;
                t.landscapingwater_mm=inputData.landscapingwater_mm;
                t.landscapingwater_kl=inputData.landscapingwater_kl;
                t.landscapingwater_lt=inputData.landscapingwater_lt;
                t.landscapingwater_ml=inputData.landscapingwater_ml;
                t.landscapingwater_gal=inputData.landscapingwater_gal;
                t.landscapingwater_ft=inputData.landscapingwater_ft;
                t.recyclewater_mt=inputData.recyclewater_mt;
                t.recylewater_cm=inputData.recylewater_cm;
                t.recyclewater_mm=inputData.recyclewater_mm;
                t.recyclewater_kl=inputData.recyclewater_kl;
                t.recyclewater_lt=inputData.recyclewater_lt;
                t.recyclewater_ml=inputData.recyclewater_ml;
                t.recyclewater_gal=inputData.recyclewater_gal;
                t.recyclewater_ft=inputData.recyclewater_ft;
            }
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
                   msg:'saved'
                });
            }
        });
    });

});

router.get('/wdc/wdcreport/:pid', function (req, res, next) {
    WDC.Project.aggregate([
        { $match:{"_id": ObjectId(req.params.pid)}},
        { $unwind:'$building_info' },
        {
            $group:
            {
               _id: {'_id':'$building_info._id','building_name':'$building_info.building_name','main_space':'$building_info.main_space','cold_demand':'$building_info.cold_demand','drink_demand':'$building_info.drink_demand','raw_demand':'$building_info.raw_demand','flush_demand':'$building_info.flush_demand','landscape_demand':'$building_info.landscape_demand','recycle_demand':'$building_info.recycle_demand','rejection_demand':'$building_info.rejection_demand'}
            }
        },
        {
            $project:
            {
                _id:'$_id._id',
                main_space:'$_id.main_space',
                building_name:'$_id.building_name',
                cold_demand:'$_id.cold_demand',
                drink_demand:'$_id.drink_demand',
                raw_demand:'$_id.raw_demand',
                flush_demand:'$_id.flush_demand',
                landscape_demand:'$_id.landscape_demand',
                recycle_demand:'$_id.recycle_demand',
                rejection_demand:'$_id.rejection_demand',
             }
        },
        { 
            $sort : { _id : 1}
        }
      ], function (err, result) {
        if (err) {
            next(err);
            console.log(err)
         
        } 
        else 
        {
            // console.log(result)
            res.json(result);
        }
    });
});

router.post('/wdc/savewdcUnit', function (req, res, next) {
    var inputData=req.body;
    WDC.Project.findById(ObjectId(inputData.pid),function(err, data){
        data.wdinput_unit=inputData.input_unit;
        data.landscapinginput_unit=inputData.landscaping_Unit;
        data.wdoutput_unit=inputData.output_unit;

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

module.exports = router;
