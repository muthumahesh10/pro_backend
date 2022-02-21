var UNITC = require('../models/unit_schema'); 

router.get('/unit/getunittype', function (req, res, next) {
    UNITC.Unit.aggregate([
        {
            $group:
            {
                _id: {'_id':'$_id','unit_type':'$unit_type'}   
            }
        },
        {
            $project:
            {
                _id:'$_id._id',
                unit_type:'$_id.unit_type'
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

router.get('/unit/getsubunittype/:utype', function (req, res, next) {
    
    UNITC.Unit.aggregate([
        { $match:{"unit_type": req.params.utype }},  
        { $unwind:'$subunit_info' },
        {
            $group:
            {
                _id: {'_id':'$subunit_info._id','subunit_type':'$subunit_info.subunit_type'}   
            }
        },
        {
            $project:
            {
                _id:'$_id._id',
                subunit_type:'$_id.subunit_type'
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

router.get('/unit/getunits/:utype/:sutype', function (req, res, next) {

    UNITC.Unit.aggregate([
        { $match:{"unit_type": req.params.utype }},  
        { $unwind:'$subunit_info' },
        { $match:{"subunit_info.subunit_type": req.params.sutype }},  
        { $unwind:'$subunit_info.parameter_info' },
        {
            $group:
            {
                _id: {'_id':'$subunit_info.parameter_info._id','unit_name':'$subunit_info.parameter_info.unit_name','factor_value':'$subunit_info.parameter_info.factor_value'}   
            }
        },
        {
            $project:
            {
                _id:'$_id._id',
                unit_name:'$_id.unit_name',
                factor_value:'$_id.factor_value'
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

router.get('/unit/getunitinfo', function (req, res, next) {
    UNITC.Unit.find({}, (err, result) => {
        res.json(result);
    });
});


router.get('/vav/unitupdate', function (req, res, next) {
    const ExcelJS = require('exceljs');
    const workbook = new ExcelJS.Workbook();
    var itemlist=[];
    workbook.xlsx.readFile('public/units/units.xlsx').then(function() {
        workbook.eachSheet((sheet, id) => {
            sheet.eachRow((row, rowIndex) => {
                itemlist.push({
                    '_id':new ObjectId(),
                    unit_name:row.values[1],
                    factor_value:row.values[2]
                }); 
            });
        });
        UNITC.Unit.findOne({unit_type:'Electrical'}, function(err, data) {

            /* data.subunit_info.push({
                '_id':new ObjectId(),
                subunit_type:'Electric Field Strength ',
                parameter_info:itemlist
            });  */
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