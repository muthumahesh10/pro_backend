var POC = require('../models/poc_schema'); 
var express = require('express');
var router = express.Router();
var ObjectId=require('mongodb').ObjectID;

router.get('/loadfactor', function (req, res, next) {
    const ExcelJS = require('exceljs');
    const workbook = new ExcelJS.Workbook();
    var bulidingInfo=[];
    workbook.xlsx.readFile('public/test.xlsx').then(function() {
        workbook.eachSheet((sheet, id) => {
            sheet.eachRow((row, rowIndex) => {
                if(rowIndex>1)
                {
                    bulidingInfo.push({
                        main_space:row.values[1],
                        group_type:row.values[2],
                        occupancy_group:row.values[3],
                        sub_space:row.values[4],
                        load_factor:row.values[5],
                    });
                }
            });
        });
        POC.Space.insertMany(bulidingInfo, function (err, docs) {
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
});

router.get('/occ/getbuildinginfo/:pid', function (req, res, next) {

    POC.Occupant.aggregate([
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
            POC.Occupant.findById(ObjectId(req.params.pid),function(err, data){
                res.status(201).json({
                    building_info:result,
                    area_unit:data.area_unit,
                });
            });
          }
    });
});

router.get('/occ/getfloorinfo/:pid/:bname', function (req, res, next) {
    POC.Occupant.aggregate([
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

router.get('/occ/getroominfo/:pid/:bname/:fname', function (req, res, next) {
    POC.Occupant.aggregate([
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

router.get('/occ/getbuildingtype', function (req, res, next) {
    POC.BTypes.aggregate([
        { $unwind:'$space_info' },
        {
            $group:
            {
                _id: {'_id':'$space_info.main_space','load_factor':'$space_info.load_factor','subspace_info':'$space_info.subspace_info'}
            }
        },
        {
            $project:
            {
                _id:0,
                main_space:'$_id._id',
                load_factor:'$_id.load_factor',
                subspace_info:'$_id.subspace_info'
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

router.post('/occ/saveoccupant', function (req, res, next) {
    var inputData=req.body;
    POC.Occupant.findById(ObjectId(inputData.pid),function(err, data){
   
        if(inputData.edit_building==false)
        {
            var index = data.building_info.findIndex(x => x.building_name==inputData.building_name && x.floor_name==inputData.floor_name && x.room_tag==inputData.room_name);
            var bid=data.building_info[index]._id;
            var t=data.building_info.id(ObjectId(bid));
            t.building_area=inputData.building_area;
            t.building_type=inputData.selectedBuildingType;
            t.building_subtype=inputData.selectedBuildingSubType;
            t.no_seats=inputData.no_seats;
            t.no_occupants=inputData.no_occupant;
            t.no_beds=inputData.no_beds;
            t.fixed_population=inputData.fixed_population;
            t.floating_population=inputData.floating_population; 
        }
        else if(inputData.edit_building==true)
        {
            data.building_info.push({
                '_id':new ObjectId(),
                building_name:inputData.building_name,
                floor_name:inputData.floor_name,
                room_tag:inputData.room_name,
                building_area:inputData.building_area,
                building_type:inputData.selectedBuildingType,
                building_subtype:inputData.selectedBuildingSubType,
                no_seats:inputData.no_seats,
                no_occupants:inputData.no_occupant,
                no_beds:inputData.no_beds,
                fixed_population:inputData.fixed_population,
                floating_population:inputData.floating_population
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
                    msg:'saved'
                });
            }
        });
    });
});

module.exports = router;