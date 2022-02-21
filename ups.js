var UPS = require('../models/ups_schema'); 
var express = require('express');
var router = express.Router();
var ObjectId=require('mongodb').ObjectID;

router.get('/uploadupscatalogues', function (req, res, next) {
    const ExcelJS = require('exceljs');
    const workbook = new ExcelJS.Workbook();
    var catalogueInfo=[];
    workbook.xlsx.readFile('public/ups_technical.xlsx').then(function() {
        workbook.eachSheet((sheet, id) => {
            sheet.eachRow((row, rowIndex) => {
                if(rowIndex>0)
                {
                    catalogueInfo.push({
                        // ups_capacity:row.values[1],
                        // frame_size:row.values[2],
                        // capacity_permodule:row.values[3],
                        // ups_framecost:row.values[4],
                        // ups_modulecost:row.values[5],
                        // ups_width:row.values[6],
                        // ups_depth:row.values[7],
                        // ups_height:row.values[8],
                        // ups_weight:row.values[9],
                        // structural_load:row.values[10],

                        // ups_capacity:row.values[1],
                        // battery_type:row.values[2],
                        // battery_size:row.values[4],
                        // backup_time:row.values[3],
                        // no_battery:row.values[5],
                        // battery_length:row.values[6],
                        // battery_width:row.values[7],
                        // battery_height:row.values[8],
                        // battery_weight:row.values[9],
                        // equipment_cost:row.values[10],
                        // no_string:row.values[11],

                        main_paraname:row.values[1],
                        parameter_name:row.values[1],
                        parameter_value:row.values[2],
                        parameter_unit:row.values[3]
                    });
                }
            });
        });
          
        UPS.Catalogue.findOne({brand_name:'Socomac'}, function(err, data) {
            
            // data.modular_info=catalogueInfo;
            data.technical_info.sub_parainfo=catalogueInfo;
            data.save(function(err, result) { 
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
    });
});

router.get("/uploadbulkupstechnicals", function(req, res) {
    const ExcelJS = require('exceljs');
    const workbook = new ExcelJS.Workbook();
    var technical_info=[];

    workbook.xlsx.readFile('public/ups_technical.xlsx').then(function() {
        workbook.eachSheet((sheet, id) => {
            sheet.eachRow((row, rowIndex) => {
                if(row.values[1]!=undefined)
                {
                    var sysIndex = technical_info.findIndex(x => x.main_paraname==row.values[1]);
                    if(sysIndex>=0)
                    {
                        technical_info[sysIndex].sub_parainfo.push({
                            '_id':new ObjectId(),
                            parameter_name:row.values[2],
                            parameter_value:row.values[3],
                            parameter_unit:row.values[4],
                        })
                    }
                    else
                    {
                        technical_info.push({
                            '_id':new ObjectId(),
                            main_paraname:row.values[1],
                            sub_parainfo:[{
                                '_id':new ObjectId(),
                                parameter_name:row.values[2],
                                parameter_value:row.values[3],
                                parameter_unit:row.values[4],
                            }]
                        });
                    }
                }
            });
        });

        var bulk = UPS.Catalogue.collection.initializeUnorderedBulkOp();
        bulk.find( { 'brand_name': 'Vertiv'} ).update( { $set: {'technical_info':technical_info} } );
        bulk.execute();
        res.json('saved');
    });
});

router.get('/ups/getupsdatas', function (req, res, next) {
    UPS.Catalogue.find({}, function (err, result) {
       
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

router.post('/ups/saveupsoutput', function (req, res, next) {
   
    var inputData=req.body;
    UPS.Project.findById(ObjectId(inputData.pid),function(err, data){
        if(inputData.application_type=='UPS')
        {
            data.building_info.push({
                '_id':new ObjectId(),
                building_name:inputData.building_name,
                building_type:inputData.building_type,
                application_type:inputData.application_type,
                space_type:inputData.space_type,
                output_power:inputData.output_power,
                ups_type:inputData.ups_type,
                future_expansion:inputData.future_expansion,
                redundancy_type:inputData.redundancy_type,
                form_factor:inputData.form_factor,
                ups_vendor:inputData.ups_vendor,
                ups_logo:inputData.ups_logo,
                ups_capacity:inputData.ups_capacity,
                frame_size:inputData.frame_size,
                no_frame:inputData.no_frame,
                module_size:inputData.module_size,
                no_modules:inputData.no_modules,
                roomarea_sqft:inputData.roomarea_sqft,
                roomarea_sqm:inputData.roomarea_sqm,
                room_depth:inputData.room_depth,
                room_width:inputData.room_width,
                ups_width:inputData.ups_width,
                ups_depth:inputData.ups_depth,
                ups_height:inputData.ups_height,
                ups_weight:inputData.ups_weight,
                ups_cost:inputData.ups_cost,

                brandC_name:inputData.brandC_name,
                brandC_logo:inputData.brandC_logo,
                upsC_capacity:inputData.upsC_capacity,
                no_ups:inputData.no_ups,
                upsC_width:inputData.upsC_width,
                upsC_depth:inputData.upsC_depth,
                upsC_height:inputData.upsC_height,
                upsC_weight:inputData.upsC_weight,
                conventional_width:inputData.conventional_width,
                conventional_depth:inputData.conventional_depth,
                conv_areaSqft:inputData.conv_areaSqft,
                conv_areaSqm:inputData.conv_areaSqm,
                conventional_cost:inputData.conventional_cost,
                total_cost:inputData.total_cost,
                total_area:inputData.total_area,
                cart_status:inputData.cart_status,
                created_date:new Date()
            }); 
        }
        else if(inputData.application_type=='Battery')
        {
            data.building_info.push({
                '_id':new ObjectId(),
                building_name:inputData.building_name,
                building_type:inputData.building_type,
                application_type:inputData.application_type,
                space_type:inputData.space_type,
                output_power:inputData.output_power,
                ups_type:inputData.ups_type,

                battery_vendor:inputData.battery_vendor,
                battery_logo:inputData.battery_logo,
                battery_type:inputData.battery_type,
                backup_time:inputData.backup_time,
                battery_size:inputData.battery_size,
                no_battery:inputData.no_battery,
                battery_length:inputData.battery_length,
                battery_width:inputData.battery_width,
                battery_height:inputData.battery_height,
                battery_weight:inputData.battery_weight,
                battery_cost:inputData.battery_cost,
                btryroom_width:inputData.btryroom_width,
                btryroom_depth:inputData.btryroom_depth,
                no_string:inputData.no_string,
                btryarea_sqm:inputData.battery_areaSqm,
                btryarea_sqft:inputData.battery_areaSqft,
                total_area:inputData.total_area,
                total_cost:inputData.total_cost,
                cart_status:inputData.cart_status,
                created_date:new Date()
            }); 
        }
        else if(inputData.application_type=='Battery + UPS') 
        {
            data.building_info.push({
                '_id':new ObjectId(),
                building_name:inputData.building_name,
                building_type:inputData.building_type,
                application_type:inputData.application_type,
                space_type:inputData.space_type,
                output_power:inputData.output_power,
                ups_type:inputData.ups_type,
                future_expansion:inputData.future_expansion,
                redundancy_type:inputData.redundancy_type,
                form_factor:inputData.form_factor,
                ups_vendor:inputData.ups_vendor,
                ups_logo:inputData.ups_logo,
                ups_capacity:inputData.ups_capacity,
                frame_size:inputData.frame_size,
                no_frame:inputData.no_frame,
                module_size:inputData.module_size,
                no_modules:inputData.no_modules,
                roomarea_sqft:inputData.roomarea_sqft,
                roomarea_sqm:inputData.roomarea_sqm,
                room_depth:inputData.room_depth,
                room_width:inputData.room_width,
                ups_width:inputData.ups_width,
                ups_depth:inputData.ups_depth,
                ups_height:inputData.ups_height,
                ups_weight:inputData.ups_weight,
                ups_cost:inputData.ups_cost,

                brandC_name:inputData.brandC_name,
                brandC_logo:inputData.brandC_logo,
                upsC_capacity:inputData.upsC_capacity,
                no_ups:inputData.no_ups,
                upsC_width:inputData.upsC_width,
                upsC_depth:inputData.upsC_depth,
                upsC_height:inputData.upsC_height,
                upsC_weight:inputData.upsC_weight,
                conventional_width:inputData.conventional_width,
                conventional_depth:inputData.conventional_depth,
                conv_areaSqft:inputData.conv_areaSqft,
                conv_areaSqm:inputData.conv_areaSqm,
                conventional_cost:inputData.conventional_cost,
                total_cost:inputData.total_cost,
                total_area:inputData.total_area,

                battery_vendor:inputData.battery_vendor,
                battery_logo:inputData.battery_logo,
                battery_type:inputData.battery_type,
                backup_time:inputData.backup_time,
                battery_size:inputData.battery_size,
                no_battery:inputData.no_battery,
                battery_length:inputData.battery_length,
                battery_width:inputData.battery_width,
                battery_height:inputData.battery_height,
                battery_weight:inputData.battery_weight,
                battery_cost:inputData.battery_cost,
                btryroom_width:inputData.btryroom_width,
                btryroom_depth:inputData.btryroom_depth,
                no_string:inputData.no_string,
                btryarea_sqm:inputData.battery_areaSqm,
                btryarea_sqft:inputData.battery_areaSqft,
                total_area:inputData.total_area,
                total_cost:inputData.total_cost,
                cart_status:inputData.cart_status,
                created_date:new Date()
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
                    msg:'saved',
                    building_info:data.building_info
                });
            }
        });
    });
});

router.get('/ups/getupsprojectinfo/:pid', function (req, res, next) {
    UPS.Project.findById(ObjectId(req.params.pid),function(err, data){
        if (err) {
            return res.status(500).json({
                title: 'An error occurred',
                error: err
            });
        }
        else
        {
            if(data==null)
            {
                res.status(201).json({
                   msg:'Not Exist'
                });
            }
            else
            {
                res.status(201).json({
                    msg:'Success',
                    project_id:data.project_id,
                    project_name:data.project_name,
                    building_info:data.building_info
                });
            }
        }
    });
});


router.get('/ups/removeupsdata/:pid/:bid', function (req, res, next) {
    UPS.Project.findById(ObjectId(req.params.pid),function(err, data){
        data.building_info.id(ObjectId(req.params.bid)).remove();
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
                    msg:'saved',
                    building_info:data.building_info
                });
            }
        });
    });
})

module.exports = router;