var WSC = require('../models/wsc_schema'); 

var express = require('express');
var router = express.Router();
var ObjectId=require('mongodb').ObjectID;

router.get('/wsc/getbuildinginfo/:pid', function (req, res, next) {
    
    WSC.Project.aggregate([
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
            WSC.Project.findById(ObjectId(req.params.pid),function(err, data){
                res.status(201).json({
                    msg:'saved',
                    buildingList:result,
                    project_name:data.project_name,
                    project_id:data.project_id,
                    waterdemand_ipunit:data.waterdemand_ipunit,
                    water_demandunit:data.water_demandunit,
                    dimension_ipunit:data.dimension_ipunit,
                    capacity_opunit:data.capacity_opunit,
                    dimension_opunit:data.dimension_opunit,
                 });
            });
        }
    });
});

router.get('/wsc/getoutputdata/:pid', function (req, res, next) {
    WSC.Project.aggregate([
        { $match:{"_id": ObjectId(req.params.pid)}},  
        { $unwind:'$building_info' },
        {
            $group:
            {
                _id: {'_id':'$building_info._id','building_name':'$building_info.building_name','ugt_width':'$building_info.ugt_width','ugt_length':'$building_info.ugt_length','ugt_depth':'$building_info.ugt_depth','ugt_capacity':'$building_info.ugt_capacity','tank_name':'$building_info.tank_name','tank_location':'$building_info.tank_location','water_demand':'$building_info.water_demand'}
            }
        },
        {
            $project:
            {
                _id:'$_id._id',
                building_name:'$_id.building_name',
                ugt_width:'$_id.ugt_width',
                ugt_length:'$_id.ugt_length',
                ugt_capacity:'$_id.ugt_capacity',
                tank_name:'$_id.tank_name',
                tank_location:'$_id.tank_location',
                water_demand:'$_id.water_demand',
            }
        },
        { 
            $sort : { "_id" : 1}
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

router.get('/wsc/getdatainfo', function (req, res, next) {
    WSC.Project.find({}, function (err, result) {
        if (err)
        {
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

router.post('/wsc/savewscunit', function (req, res, next) {
    var inputData=req.body;
    WSC.Project.findById(ObjectId(inputData.pid),function(err, data){
        data.capacity_opunit=inputData.capacity_opunit;
        data.water_demandunit=inputData.water_demandunit;
        data.waterdemand_ipunit=inputData.waterdemand_ipunit;
        data.dimension_ipunit=inputData.dimension_ipunit;
        data.dimension_opunit=inputData.dimension_opunit;

   
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

router.post('/wsc/savewaterstroageoutput', function (req, res, next) {
   
    var inputData=req.body;
    WSC.Project.findById(ObjectId(inputData.pid),function(err, data){
       
        if(inputData.edit_building==false)
        {
            var index = data.building_info.findIndex(x => x.building_name==inputData.building_name);
        
            var bid=data.building_info[index]._id;
            var t=data.building_info.id(ObjectId(bid));

            t.tank_name=inputData.selectedTank;
            t.water_demand=inputData.water_demand;
            t.tank_location=inputData.selectedLocation;
            t.days_stored=inputData.selectedDays;
            t.free_board=inputData.free_board;
            t.ugt_width=inputData.ugt_width;
            t.ugt_length=inputData.ugt_length;
            t.ugt_depth=inputData.ugt_depth;
            t.ugt_capacity=inputData.ugt_capacity;
            t.ugt_compartment=inputData.ugt_compartment;
            t.oht_width=inputData.oht_width;
            t.oht_length=inputData.oht_length;
            t.oht_depth=inputData.oht_depth;
            t.oht_capacity=inputData.oht_capacity;
            t.oht_compartment=inputData.oht_compartment;
                      
            t.ugtwidth_m=inputData.ugtwidth_m;
            t.ugtwidth_cm=inputData.ugtwidth_cm;
            t.ugtwidth_mm=inputData.ugtwidth_mm;
            t.ugtwidth_inch=inputData.ugtwidth_inch;
            t.ugtwidth_ft=inputData.ugtwidth_ft;

            t.ohtwidth_m=inputData.ohtwidth_m;
            t.ohtwidth_cm=inputData.ohtwidth_cm;
            t.ohtwidth_mm=inputData.ohtwidth_mm;
            t.ohtwidth_inch=inputData.ohtwidth_inch;
            t.ohtwidth_ft=inputData.ohtwidth_ft;


            t.ugtlength_m=inputData.ugtlength_m;
            t.ugtlength_cm=inputData.ugtlength_cm;
            t.ugtlength_mm=inputData.ugtlength_mm;
            t.ugtlength_inch=inputData.ugtlength_inch;
            t.ugtlength_ft=inputData.ugtlength_ft;

            t.ohtlength_m= inputData.ohtlength_m;
            t.ohtlength_cm= inputData.ohtlength_cm;
            t.ohtlength_mm=inputData.ohtlength_mm;
            t.ohtlength_inch=inputData.ohtlength_inch;
            t.ohtlength_ft=inputData.ohtlength_ft;
     
            t.ohtcapacity_m3=inputData.ohtcapacity_m3;
            t.ohtcapacity_cm3=inputData.ohtcapacity_cm3;
            t.ohtcapacity_mm3=inputData.ohtcapacity_mm3;
            t.ohtcapacity_kl=inputData.ohtcapacity_kl;
            t.ohtcapacity_litres=inputData.ohtcapacity_litres;
            t.ohtcapacity_ml=inputData.ohtcapacity_ml;
            t.ohtcapacity_gallons=inputData.ohtcapacity_gallons;
            t.ohtcapacity_ft3=inputData.ohtcapacity_ft3;

            t.ugtcapacity_m3=inputData.ugtcapacity_m3;
            t.ugtcapacity_cm3=inputData.ugtcapacity_cm3;
            t.ugtcapacity_mm3=inputData.ugtcapacity_mm3;
            t.ugtcapacity_kl=inputData.ugtcapacity_kl;
            t.ugtcapacity_litres=inputData.ugtcapacity_litres;
            t.ugtcapacity_ml=inputData.ugtcapacity_ml;
            t.ugtcapacity_gallons=inputData.ugtcapacity_gallons;
            t.ugtcapacity_ft3=inputData.ugtcapacity_ft3;
        }
        else if(inputData.edit_building==true)
        {
            var index = data.building_info.findIndex(x => x.building_name==inputData.building_name);
            if(index<0)
            {
                data.building_info.push({
                '_id':new ObjectId(),
                
                building_name:inputData.building_name,
                tank_name:inputData.selectedTank,
                water_demand:inputData.water_demand,
                tank_location:inputData.selectedLocation,
                days_stored:inputData.selectedDays,
                free_board:inputData.free_board,
                ugt_width:inputData.ugt_width,
                ugt_length:inputData.ugt_length,
                ugt_depth:inputData.ugt_depth,
                ugt_capacity:inputData.ugt_capacity,
                ugt_compartment:inputData.ugt_compartment,
                oht_width:inputData.oht_width,
                oht_length:inputData.oht_length,
                oht_depth:inputData.oht_depth,
                oht_capacity:inputData.oht_capacity,
                oht_compartment:inputData.oht_compartment,

                ugtwidth_m:inputData.ugtwidth_m,
                ugtwidth_cm:inputData.ugtwidth_cm,
                ugtwidth_mm:inputData.ugtwidth_mm,
                ugtwidth_inch:inputData.ugtwidth_inch,
                ugtwidth_ft:inputData.ugtwidth_ft,

                ohtwidth_m:inputData.ohtwidth_m,
                ohtwidth_cm:inputData.ohtwidth_cm,
                ohtwidth_mm:inputData.ohtwidth_mm,
                ohtwidth_inch:inputData.ohtwidth_inch,
                ohtwidth_ft:inputData.ohtwidth_ft,
                
                ugtlength_m:inputData.ugtlength_m,
                ugtlength_cm:inputData.ugtlength_cm,
                ugtlength_mm:inputData.ugtlength_mm,
                ugtlength_inch:inputData.ugtlength_inch,
                ugtlength_ft:inputData.ugtlength_ft,

                ugtdepth_m:inputData.ugtdepth_m,
                ugtdepth_cm:inputData.ugtdepth_cm,
                ugtdepth_mm:inputData.ugtdepth_mm,
                ugtdepth_ft:inputData.ugtdepth_ft,
                ugtdepth_inch:inputData.ugtdepth_inch,

                ohtdepth_m:inputData.ohtdepth_m,
                ohtdepth_cm:inputData.ohtdepth_cm,
                ohtdepth_mm:inputData.ohtdepth_mm,
                ohtdepth_ft:inputData.ohtdepth_ft,
                ohtdepth_inch:inputData.ohtdepth_inch,

                ohtlength_m:inputData.ohtlength_m,
                ohtlength_cm:inputData.ohtlength_cm,
                ohtlength_mm:inputData.ohtlength_mm,
                ohtlength_inch:inputData.ohtlength_inch,
                ohtlength_ft:inputData.ohtlength_ft,

                ohtcapacity_m3:inputData.ohtcapacity_m3,
                ohtcapacity_cm3:inputData.ohtcapacity_cm3,
                ohtcapacity_mm3:inputData.ohtcapacity_mm3,
                ohtcapacity_kl:inputData.ohtcapacity_kl,
                ohtcapacity_litres:inputData.ohtcapacity_litres,
                ohtcapacity_ml:inputData.ohtcapacity_ml,
                ohtcapacity_gallons:inputData.ohtcapacity_gallons,
                ohtcapacity_ft3:inputData.ohtcapacity_ft3,

                ugtcapacity_m3:inputData.ugtcapacity_m3,
                ugtcapacity_cm3:inputData.ugtcapacity_cm3,
                ugtcapacity_mm3:inputData.ugtcapacity_mm3,
                ugtcapacity_kl:inputData.ugtcapacity_kl,
                ugtcapacity_litres:inputData.ugtcapacity_litres,
                ugtcapacity_ml:inputData.ugtcapacity_ml,
                ugtcapacity_gallons:inputData.ugtcapacity_gallons,
                ugtcapacity_ft3:inputData.ugtcapacity_ft3,
            
                })
            }
            else
            {
                var bid=data.building_info[index]._id;
                var t=data.building_info.id(ObjectId(bid));

                t.tank_name=inputData.selectedTank;
                t.water_demand=inputData.water_demand;
                t.tank_location=inputData.selectedLocation;
                t.days_stored=inputData.selectedDays;
                t.free_board=inputData.free_board;
                t.ugt_width=inputData.ugt_width;
                t.ugt_length=inputData.ugt_length;
                t.ugt_depth=inputData.ugt_depth;
                t.ugt_capacity=inputData.ugt_capacity;
                t.ugt_compartment=inputData.ugt_compartment;
                t.oht_width=inputData.oht_width;
                t.oht_length=inputData.oht_length;
                t.oht_depth=inputData.oht_depth;
                t.oht_capacity=inputData.oht_capacity;
                t.oht_compartment=inputData.oht_compartment;
                        
                t.ugtwidth_m=inputData.ugtwidth_m;
                t.ugtwidth_cm=inputData.ugtwidth_cm;
                t.ugtwidth_mm=inputData.ugtwidth_mm;
                t.ugtwidth_inch=inputData.ugtwidth_inch;
                t.ugtwidth_ft=inputData.ugtwidth_ft;

                t.ohtwidth_m=inputData.ohtwidth_m;
                t.ohtwidth_cm=inputData.ohtwidth_cm;
                t.ohtwidth_mm=inputData.ohtwidth_mm;
                t.ohtwidth_inch=inputData.ohtwidth_inch;
                t.ohtwidth_ft=inputData.ohtwidth_ft;

                t.ugtlength_m=inputData.ugtlength_m;
                t.ugtlength_cm=inputData.ugtlength_cm;
                t.ugtlength_mm=inputData.ugtlength_mm;
                t.ugtlength_inch=inputData.ugtlength_inch;
                t.ugtlength_ft=inputData.ugtlength_ft;

                t.ohtlength_m= inputData.ohtlength_m;
                t.ohtlength_cm= inputData.ohtlength_cm;
                t.ohtlength_mm=inputData.ohtlength_mm;
                t.ohtlength_inch=inputData.ohtlength_inch;
                t.ohtlength_ft=inputData.ohtlength_ft;
        
                t.ohtcapacity_m3=inputData.ohtcapacity_m3;
                t.ohtcapacity_cm3=inputData.ohtcapacity_cm3;
                t.ohtcapacity_mm3=inputData.ohtcapacity_mm3;
                t.ohtcapacity_kl=inputData.ohtcapacity_kl;
                t.ohtcapacity_litres=inputData.ohtcapacity_litres;
                t.ohtcapacity_ml=inputData.ohtcapacity_ml;
                t.ohtcapacity_gallons=inputData.ohtcapacity_gallons;
                t.ohtcapacity_ft3=inputData.ohtcapacity_ft3;

                t.ugtcapacity_m3=inputData.ugtcapacity_m3;
                t.ugtcapacity_cm3=inputData.ugtcapacity_cm3;
                t.ugtcapacity_mm3=inputData.ugtcapacity_mm3;
                t.ugtcapacity_kl=inputData.ugtcapacity_kl;
                t.ugtcapacity_litres=inputData.ugtcapacity_litres;
                t.ugtcapacity_ml=inputData.ugtcapacity_ml;
                t.ugtcapacity_gallons=inputData.ugtcapacity_gallons;
                t.ugtcapacity_ft3=inputData.ugtcapacity_ft3;
            }
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
                   msg:'saved'
                });
            }
        });
        });
});

module.exports = router;