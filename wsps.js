var WSPS = require('../models/wsps_schema'); 
var express = require('express');
var router = express.Router();
var ObjectId=require('mongodb').ObjectID;

router.get('/uploadflowrates', function (req, res, next) {
    const ExcelJS = require('exceljs');
    const workbook = new ExcelJS.Workbook();
    var flowrateInfo=[];
    workbook.xlsx.readFile('public/flowrates.xlsx').then(function() {
        workbook.eachSheet((sheet, id) => {
            sheet.eachRow((row, rowIndex) => {
                if(rowIndex>0)
                {
                    flowrateInfo.push({
                        fixture_unit:row.values[1],
                        flow_rate:row.values[2]
                    });
                }
            });
        });
        WSPS.Flowrate.insertMany(flowrateInfo, function (err, docs) {
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


router.get('/wsps/getflowrates', function (req, res, next) {
    WSPS.Flowrate.aggregate([
        {
            $group:
            {
                _id: {'_id':'$_id','fixture_unit':'$fixture_unit','flow_rate':'$flow_rate'}   
            }
        },
        {
            $project:
            {
                _id:0,
                fixture_unit:'$_id.fixture_unit',
                flow_rate:'$_id.flow_rate'
            }
        },
        { 
            $sort : { fixture_unit : 1}
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

router.post('/wsps/savepipesize', function (req, res, next) {
   
    var inputData=req.body;
    WSPS.Project.findById(ObjectId(inputData.pid),function(err, data){
        
        data.total_wsps=data.total_wsps+1;
        
        var addlFlowrate=[];
        inputData.additionalFlowrate.forEach(function(item){
            addlFlowrate.push({
                '_id':new ObjectId(),
                flow_rate:item.flow_rate
            });
        })

        if(inputData.edit_building==false)
        {
            var index = data.building_info.findIndex(x => x.building_name==inputData.building_name && x.floor_name==inputData.floor_name && x.room_tag==inputData.room_tag);
        
            var bid=data.building_info[index]._id;
            var t=data.building_info.id(ObjectId(bid));
         
            t.building_area=inputData.building_area;
            t.wsps_info.push({
                '_id':new ObjectId(),
                fixture_type:inputData.selectedFixtureType,
                fixture_unit:inputData.fixture_unit,
                flow_rate:inputData.flow_rate,
                water_velocity:inputData.water_velocity,
                total_flowrate:inputData.total_flowrate,
                pipe_size:inputData.pipe_size,
                addl_flowrate:addlFlowrate
            });
        }
        else if(inputData.edit_building==true)
        {
            var index = data.building_info.findIndex(x => x.building_name==inputData.building_name && x.floor_name==inputData.floor_name && x.room_tag==inputData.room_tag);
            if(index<0)
            {
                data.building_info.push({
                    '_id':new ObjectId(),
                    building_name:inputData.building_name,
                    floor_name:inputData.floor_name,
                    room_tag:inputData.room_tag,
                    building_area:inputData.building_area,
                    wsps_info:[{
                        '_id':new ObjectId(),
                        fixture_type:inputData.selectedFixtureType,
                        fixture_unit:inputData.fixture_unit,
                        flow_rate:inputData.flow_rate,
                        water_velocity:inputData.water_velocity,
                        total_flowrate:inputData.total_flowrate,
                        pipe_size:inputData.pipe_size,
                        addl_flowrate:addlFlowrate
                    }]
                }); 
            }
            else
            {
                data.building_info[index].wsps_info.push({
                    '_id':new ObjectId(),
                    fixture_type:inputData.selectedFixtureType,
                    fixture_unit:inputData.fixture_unit,
                    flow_rate:inputData.flow_rate,
                    water_velocity:inputData.water_velocity,
                    total_flowrate:inputData.total_flowrate,
                    pipe_size:inputData.pipe_size,
                    addl_flowrate:addlFlowrate
                });
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
                    total_vav:data.total_vav
                });
            }
        });
    });

});

module.exports = router;