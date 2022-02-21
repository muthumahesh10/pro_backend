var ATS = require('../models/ats_schema'); 
var express = require('express');
var router = express.Router();
var ObjectId=require('mongodb').ObjectID;
const { Catalogue } = require('../models/ats_schema');

router.get('/uploadatscatalogues', function (req, res, next) {
    const ExcelJS = require('exceljs');
    const workbook = new ExcelJS.Workbook();
    var catalogueInfo=[];
    workbook.xlsx.readFile('public/atscatalogues.xlsx').then(function() {
        workbook.eachSheet((sheet, id) => {
            sheet.eachRow((row, rowIndex) => {
                if(rowIndex>0)
                {
                    
                    catalogueInfo.push({
                        neck_size:row.values[1],
                        neck_velocity:row.values[2],
                        //disc_position:row.values[3],
                        cfm_value:row.values[3],
                        pressure_drop:row.values[4],
                        // throw_ft:row.values[5],
                        nosie_criteria:row.values[5],
                        discharge_velocity:row.values[6],
                        velocity_10m:row.values[7],
                        velocity_20m:row.values[8],
                        velocity_30m:row.values[9]
                    });     
                   
                   /*  catalogueInfo.push({
                        neck_size:row.values[1],
                        //outer_size:row.values[2],
                        //open_size:row.values[3],
                        //flange_size:row.values[3],
                        //depth_size:row.values[4],
                        face_area:row.values[2]
                    });    */
                }
            });
        });
          
        ATS.Catalogue.findOne({catalogue_name:'Jet Nozzle'}, function(err, data) {
            
            data.supplyair_info=catalogueInfo;
            //data.dimension_info=catalogueInfo;
            
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

router.get('/ats/getdiffusercatalogue/:dfftype', function (req, res, next) {
    ATS.Catalogue.findOne({catalogue_name:req.params.dfftype}, function(err, data) {
        res.status(201).json({
            supplyair_info:data.supplyair_info,
            returnair_info:data.returnair_info,
            dimension_info:data.dimension_info,
            
        });
        console.log(data.supplyair_info)
    });
}); 


router.get('/ats/getbuildinginfo/:pid', function (req, res, next) {
 
    ATS.Project.aggregate([
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
            ATS.Project.findById(ObjectId(req.params.pid),function(err, data){
                res.status(201).json({
                    project_name:data.project_name,
                    project_id:data.project_id,
                    total_diffuser:data.total_diffuser,
                    input_unit:data.input_unit,
                    output_unit:data.output_unit,
                    airflow_units:data.airflow_units,
                    neckvelocity_unit:data.neckvelocity_unit,
                    actualvlocity_unit:data.actualvlocity_unit,
                    actualvlocity_from:data.actualvlocity_from,
                    pressuredrop_units:data.pressuredrop_units,
                    pressuredrop_from:data.pressuredrop_from,
                    distancecoverage_unit:data.distancecoverage_unit,
                    distancecoverage_from:data.distancecoverage_from,
                    outersize_units:data.outersize_units,
                    outersize_from:data.outersize_from,
                    ceilingopen_unit:data.ceilingopen_unit,
                    ceilingopen_from:data.ceilingopen_from,

                    
                });
            });
          }
    });
});

router.get('/ats/getatsdatas/:pid',(req,res,next)=>{ 
    ATS.Project.aggregate([
        { $match:{"_id": ObjectId(req.params.pid)}},  
        { $unwind: '$building_info' },
        {
            $group:
            {
                _id: {'_id':'$building_info._id','building_name':'$building_info.building_name','building_area':'$building_info.building_area','building_type':'$building_info.building_type','floor_name':'$building_info.floor_name','room_tag':'$building_info.room_tag','ceiling_type':'$building_info.ceiling_type','ceiling_height':'$building_info.ceiling_height','application_type':'$building_info.application_type','diffuser_type':'$building_info.diffuser_type','airflow_rate':'$building_info.airflow_rate','neck_velocity':'$building_info.neck_velocity','neck_size':'$building_info.neck_size','no_diffuser':'$building_info.no_diffuser','airflowper_diffuser':'$building_info.airflowper_diffuser','design_cfm':'$building_info.design_cfm','calculated_cfm':'$building_info.calculated_cfm','pressure_drop':'$building_info.pressure_drop','throw_value':'$building_info.throw_value','noise_criteria':'$building_info.noise_criteria','outer_size':'$building_info.outer_size','open_size':'$building_info.open_size',}   
            }
        },
        {
            $project:
            {
                _id:'$_id._id',
                'building_name':'$_id.building_name',
                'building_area':'$_id.building_area',
                'building_type':'$_id.building_type',
                'floor_name':'$_id.floor_name',
                'room_tag':'$_id.room_tag',
                'ceiling_type':'$_id.ceiling_type',
                'ceiling_height':'$_id.ceiling_height',
                'application_type':'$_id.application_type',
                'diffuser_type':'$_id.diffuser_type',
                'airflow_rate':'$_id.airflow_rate',
                'neck_velocity':'$_id.neck_velocity',
                'neck_size':'$_id.neck_size',
                'no_diffuser':'$_id.no_diffuser',
                'airflowper_diffuser':'$_id.airflowper_diffuser',
                'design_cfm':'$_id.design_cfm',
                'calculated_cfm':'$_id.calculated_cfm',
                'pressure_drop':'$_id.pressure_drop',
                'throw_value':'$_id.throw_value',
                'noise_criteria':'$_id.noise_criteria',
                'outer_size':'$_id.outer_size',
                'open_size':'$_id.open_size'
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


router.post('/ats/savediffuseroutput', function (req, res, next) {
   
    var inputData=req.body;
    
    ATS.Project.findById(ObjectId(inputData.pid),function(err, data){
        
        data.total_diffuser=data.total_diffuser+1;
        
        if(inputData.edit_building==false)
        {
            var index = data.building_info.findIndex(x => x.building_name==inputData.building_name && x.floor_name==inputData.floor_name && x.room_tag==inputData.room_tag);
        
            var bid=data.building_info[index]._id;
            var t=data.building_info.id(ObjectId(bid));
         
            t.building_area=inputData.building_area;
            t.building_type=inputData.building_type;
            t.building_subtype=inputData.building_subtype;
            t.ceiling_type=inputData.ceiling_type;
            t.ceiling_height=inputData.ceiling_height;
            t.application_type=inputData.application_type;
            t.diffuser_type=inputData.diffuser_type;
            t.airflow_rate=inputData.airflow_rate;
            t.neck_velocity=inputData.neck_velocity;
            t.neck_size=inputData.neck_size;
            t.no_diffuser=inputData.no_diffuser;
            t.airflowper_diffuser=inputData.airflowper_diffuser;
            t.design_cfm=inputData.design_cfm;
            t.calculated_cfm=inputData.calculated_cfm;
            t.pressure_drop=inputData.pressure_drop;
            t.throw_value=inputData.throw_value;
            t.noise_criteria=inputData.noise_criteria;
            t.outer_size=inputData.outer_size;
            t.open_size=inputData.open_size;
            t.outersize_mm=inputData.outersize_mm,
            t.outersize_mt=inputData.outersize_mt,
            t.outersize_inch=inputData.outersize_inch,
            t.celingopen_mm=inputData.celingopen_mm,
            t.celingopen_mt=inputData.celingopen_mt,
            t.celingopen_inch=inputData.celingopen_inch,
            t.pressuredrop_inch=inputData.pressuredrop_inch,
            t.pressuredrop_pa=inputData.pressuredrop_pa,
            t.pressuredrop_m=inputData.pressuredrop_mm,
            t.distancecoverage_ft=inputData.distancecoverage_ft,
            t.distancecoverage_mt=inputData.distancecoverage_mt,
            t.distancecoverage_mm=inputData.distancecoverage_mm
        }
        
        else if(inputData.edit_building==true)
        {
            data.building_info.push({
                '_id':new ObjectId(),
                building_name:inputData.building_name,
                floor_name:inputData.floor_name,
                room_tag:inputData.room_tag,
                building_area:inputData.building_area,
                building_type:inputData.building_type,
                building_subtype:inputData.building_subtype,
                ceiling_type:inputData.ceiling_type,
                ceiling_height:inputData.ceiling_height,
                application_type:inputData.application_type,
                diffuser_type:inputData.diffuser_type,
                airflow_rate:inputData.airflow_rate,
                neck_velocity:inputData.neck_velocity,
                neck_size:inputData.neck_size,
                no_diffuser:inputData.no_diffuser,
                airflowper_diffuser:inputData.airflowper_diffuser,
                design_cfm:inputData.design_cfm,
                calculated_cfm:inputData.calculated_cfm,
                pressure_drop:inputData.pressure_drop,
                throw_value:inputData.throw_value,
                noise_criteria:inputData.noise_criteria,
                outer_size:inputData.outer_size,
                open_size:inputData.open_size,

                outersize_mm:inputData.outersize_mm,
                outersize_mt:inputData.outersize_mt,
                outersize_inch:inputData.outersize_inch,
                celingopen_mm:inputData.celingopen_mm,
                celingopen_mt:inputData.celingopen_mt,
                celingopen_inch:inputData.celingopen_inch,
                pressuredrop_inch:inputData.pressuredrop_inch,
                pressuredrop_pa:inputData.pressuredrop_pa,
                pressuredrop_mm:inputData.pressuredrop_mm,
                distancecoverage_ft:inputData.distancecoverage_ft,
                distancecoverage_mt:inputData.distancecoverage_mt,
                distancecoverage_mm:inputData.distancecoverage_mm,

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
                    total_diffuser:data.total_diffuser
                });
            }
        });
    });

});

router.post('/ats/saveatsunit', function (req, res, next) {
    var inputData=req.body;
    ATS.Project.findById(ObjectId(inputData.pid),function(err, data){
        data.input_unit=inputData.input_unit,
        data.output_unit=inputData.output_unit,
        data.airflow_units=inputData.airflow_units,
        data.neckvelocity_unit=inputData.neckvelocity_unit,
        data.actualvlocity_unit=inputData.actualvlocity_unit,
        data.actualvlocity_from=inputData.actualvlocity_from,
        data.pressuredrop_units=inputData.pressuredrop_units,
        data.pressuredrop_from=inputData.pressuredrop_from,
        data.distancecoverage_unit=inputData.distancecoverage_unit,
        data.distancecoverage_from=inputData.distancecoverage_from,
        data.outersize_units=inputData.outersize_units,
        data.outersize_from=inputData.outersize_from,
        data.ceilingopen_unit=inputData.ceilingopen_unit,
        data.ceilingopen_from=inputData.ceilingopen_from,

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
})

module.exports = router;