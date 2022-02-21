var TFC = require('../models/tfc_schema'); 
var express = require('express');
var router = express.Router();
var ObjectId=require('mongodb').ObjectID;
var Thogupu = require('../models/thogupu_schema');
var jwtAuth = require('./jwt_auth.js');
const nodemailer = require('nodemailer');
var Thogupukey = require('../emailkey/key.json');

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

router.get('/tfc/gettfcprojectInfo/:pid', function (req, res, next) {
    TFC.Project.findById(ObjectId(req.params.pid), function(err,data){
        res.status(201).json({
            msg:'saved',
            pname:data.project_name,
            project_id:data.project_id
        });
    });
});

router.post('/tfc/savetfcproject',  function (req, res  ) {      
    console.log('req.body.pid '+req.body.pid);
    TFC.Project.findById(ObjectId(req.body.pid), function(err,data){
        var buildid=new ObjectId();

        data.building_info.push({
            '_id':buildid,
            building_name:req.body.building_name,
            floor_name:req.body.floor_name,
            room_name:req.body.room_name,
            building_type:req.body.building_type,
            sub_buildingtype:req.body.sub_buildingtype,
        });

        var t=data.building_info.id(ObjectId(buildid));
        
        switch(req.body.building_type)
        {
            // 1 . market building 
            // case 'Hotels' :
            //     t.shop_male=req.body.shop_male;
            //     t.shop_female=req.body.shop_female;
            //     t.shop_total=req.body.shop_total;
            //     t.ctmb_male=req.body.ctmb_male;
            //     t.ctmb_female=req.body.ctmb_female;
            //     t.ctmb_total=req.body.ctmb_total;
            //     t.ptfb_male=req.body.ptfb_male;
            //     t.ptfb_female=req.body.ptfb_female;
            //     t.ptfb_total=req.body.ptfb_total;
            //     t.occu_total=req.body.occu_total;
            //     t.water_shopmale=req.body.water_shopmale;
            //     t.ablution_shopmale=req.body.ablution_shopmale;
            //     t.ablution_shopfemale=req.body.ablution_shopfemale;
            //     t.urinals_shopmale=req.body.urinals_shopmale;
            //     t.urinals_shopfemale=req.body.urinals_shopfemale;
            //     t.wash_shopmale=req.body.wash_shopmale;
            //     t.wash_shopfemale=req.body.wash_shopfemale;
            //     t.bath_shopmale=req.body.bath_shopmale;
            //     t.bath_shopfemale=req.body.bath_shopfemale;
            //     t.water_commonmale=req.body.water_commonmale;
            //     t.water_commonfemale=req.body.water_commonfemale;
            //     t.ablution_commonmale=req.body.ablution_commonmale;
            //     t.ablution_commonfemale=req.body.ablution_commonfemale;
            //     t.urinals_commonmale=req.body.urinals_commonmale;
            //     t.urinals_commonfemale=req.body.urinals_commonfemale;
            //     t.wash_commonmale=req.body.wash_commonmale;
            //     t.wash_commonfemale=req.body.wash_commonfemale;
            //     t.bath_commonmale=req.body.bath_commonmale;
            //     t.bath_commonfemale=req.body.bath_commonfemale;
            //     t.water_publicmale=req.body.water_publicmale;
            //     t.water_publicfemale=req.body.water_publicfemale;
            //     t.ablution_publicmale=req.body.ablution_publicmale;
            //     t.ablution_publicfemale=req.body.ablution_publicfemale;
            //     t.urinals_publicmale=req.body.urinals_publicmale;
            //     t.urinals_publicfemale=req.body.urinals_publicfemale;
            //     t.wash_publicmale=req.body.wash_publicmale;
            //     t.wash_publicfemale=req.body.wash_publicfemale;
            //     t.bath_publicmale=req.body.bath_publicmale;
            //     t.bath_publicfemale=req.body.bath_publicfemale;
            // break;

        // 2 . school info 

            case 'Schools up to senior secondary level' :
            case 'All others/training institutions' :
                t.nursery_boys=req.body.nursery_boys;
                t.nonr_boys=req.body.nonr_boys;
                t.nonr_girls=req.body.nonr_girls;
                t.res_boys=req.body.res_boys;
                t.res_girls=req.body.res_girls;
                t.nursery_total=req.body.nursery_total;
                t.nonr_total=req.body.nonr_total;
                t.res_total=req.body.res_total;
                t.total_occschl=req.body.total_occschl;
                t.water_nursboys=req.body.water_nursboys;
                t.ablution_nursboys=req.body.ablution_nursboys;
                t.urinals_nursboys=req.body.urinals_nursboys;
                t.wash_nursboys=req.body.wash_nursboys;
                t.bath_nursboys=req.body.bath_nursboys;
                t.water_nonrboys=req.body.water_nonrboys;
                t.water_nonrgirls=req.body.water_nonrgirls;
                t.ablution_nonrboys=req.body.ablution_nonrboys;
                t.ablution_nonrgirls=req.body.ablution_nonrgirls;
                t.urinals_nonrboys=req.body.urinals_nonrboys;
                t.urinals_nonrgirls=req.body.urinals_nonrgirls;
                t.wash_nonrboys=req.body.wash_nonrboys;
                t.wash_nonrgirls=req.body.wash_nonrgirls;
                t.bath_nonrboys=req.body.bath_nonrboys;
                t.bath_nonrgirls=req.body.bath_nonrgirls;
                t.water_resboys=req.body.water_resboys;
                t.water_resgirls=req.body.water_resgirls;
                t.ablution_resboys=req.body.ablution_resboys;
                t.ablution_resgirls=req.body.ablution_resgirls;
                t.urinals_resboys=req.body.urinals_resboys;
                t.urinals_resgirls=req.body.urinals_resgirls;
                t.wash_resboys=req.body.wash_resboys;
                t.wash_resgirls=req.body.wash_resgirls;
                t.bath_resboys=req.body.bath_resboys;
                t.bath_resgirls=req.body.bath_resgirls;

                t.drinking_nursboys=req.body.drinking_nursboys;
                t.cleaners_nursery=req.body.cleaners_nursery;
                t.drinking_nonrboys=req.body.drinking_nonrboys;
                t.drinking_nonrgirls=req.body.drinking_nonrgirls;
                t.cleaners_nonr=req.body.cleaners_nonr;
                t.drinking_resboys=req.body.drinking_resboys;
                t.drinking_resgirls=req.body.drinking_resgirls;
                t.cleaners_res=req.body.cleaners_res;

            break;

        // 3 . hostels 

            case 'Hostels' :
            case 'Dormitories' :
            case 'Homes for the aged' :
            case 'Orphanages' :
            case 'Penal and mental institutions' :
            case 'Custodial institutions' :

                t.resident_male=req.body.resident_male;
                t.resident_female=req.body.resident_female;
                t.resident_total=req.body.resident_total;
                t.nr_male=req.body.nr_male;
                t.nr_female=req.body.nr_female;
                t.nr_total=req.body.nr_total;
                t.vcr_male=req.body.vcr_male;
                t.vcr_female=req.body.vcr_female;
                t.vcr_total=req.body.vcr_total;
                t.Hos_total=req.body.Hos_total;
                t.water_residentmale=req.body.water_residentmale;
                t.water_residentfemale=req.body.water_residentfemale;
                t.ablution_residentmale=req.body.ablution_residentmale;
                t.ablution_residentfemale=req.body.ablution_residentfemale;
                t.urinals_residentmale=req.body.urinals_residentmale;
                t.urinals_residentfemale=req.body.urinals_residentfemale;
                t.wash_residentmale=req.body.wash_residentmale;
                t.wash_residentfemale=req.body.wash_residentfemale;
                t.bath_residentmale=req.body.bath_residentmale;
                t.bath_residentfemale=req.body.bath_residentfemale;
                t.water_nrmale=req.body.water_nrmale;
                t.water_nrfemale=req.body.water_nrfemale;
                t.ablution_nrmale=req.body.ablution_nrmale;
                t.ablution_nrfemale=req.body.ablution_nrfemale;
                t.urinals_nrmale=req.body.urinals_nrmale;
                t.urinals_nrfemale=req.body.urinals_nrfemale;
                t.wash_nrmale=req.body.wash_nrmale;
                t.wash_nrfemale=req.body.wash_nrfemale;
                t.bath_nrmale=req.body.bath_nrmale;
                t.bath_nrfemale=req.body.bath_nrfemale;
                t.water_vcrmale=req.body.water_vcrmale;
                t.water_vcrfemale=req.body.water_vcrfemale;
                t.ablution_vcrfemale=req.body.ablution_vcrfemale;
                t.ablution_vcrmale=req.body.ablution_vcrmale;
                t.urinals_vcrmale=req.body.urinals_vcrmale;
                t.urinals_vcrfemale=req.body.urinals_vcrfemale;
                t.wash_vcrmale=req.body.wash_vcrmale;
                t.wash_vcrfemale=req.body.wash_vcrfemale;
                t.bath_vcrmale=req.body.bath_vcrmale;
                t.bath_vcrfemale=req.body.bath_vcrfemale;

                t.cleaners_resident=req.body.cleaners_resident;
                t.cleaners_nonresident=req.body.cleaners_nonresident;
                t.cleaners_visitor=req.body.cleaners_visitor;

            break;

        // 4 . administrative_info 

            // case 'Secondary care hospital' :
            //     t.st_male=req.body.st_male;
            //     t.st_female=req.body.st_female;
            //     t.st_total=req.body.st_total;
            //     t.water_stmale=req.body.water_stmale;
            //     t.water_stfemale=req.body.water_stfemale;
            //     t.ablution_stmale=req.body.ablution_stmale;
            //     t.ablution_stfemale=req.body.ablution_stfemale;
            //     t.urinals_stmale=req.body.urinals_stmale;
            //     t.urinals_stfemale=req.body.urinals_stfemale;
            //     t.wash_stmale=req.body.wash_stmale;
            //     t.wash_stfemale=req.body.wash_stfemale;
            //     t.bath_stmale=req.body.bath_stmale;
            //     t.bath_stfemale=req.body.bath_stfemale;

            // break;

        // 5 . restaurant_info 

            case 'Dining areas and restaurants with seating and table' :

                t.restaurant_publicmale=req.body.restaurant_publicmale;
                t.restaurant_publicfemale=req.body.restaurant_publicfemale;
                t.restaurant_nonrmale=req.body.restaurant_nonrmale;
                t.restaurant_nonrfemale=req.body.restaurant_nonrfemale;
                t.proom_total=req.body.proom_total;
                t.res_nonrtotal=req.body.res_nonrtotal;
                t.total_occres=req.body.total_occres;
                t.water_restaurantmale=req.body.water_restaurantmale;
                t.water_restaurantfemale=req.body.water_restaurantfemale;
                t.ablution_restaurantmale=req.body.ablution_restaurantmale;
                t.ablution_restaurantfemale=req.body.ablution_restaurantfemale;
                t.urinals_restaurantmale=req.body.urinals_restaurantmale;
                t.urinals_restaurantfemale=req.body.urinals_restaurantfemale;
                t.wash_restaurantmale=req.body.wash_restaurantmale;
                t.wash_restaurantfemale=req.body.wash_restaurantfemale;
                t.water_nonrmale=req.body.water_nonrmale;
                t.water_nonrfemale=req.body.water_nonrfemale;
                t.ablution_nonrmale=req.body.ablution_nonrmale;
                t.ablution_nonrfemale=req.body.ablution_nonrfemale;
                t.urinals_nonrmale=req.body.urinals_nonrmale;
                t.urinals_nonrfemale=req.body.urinals_nonrfemale;
                t.wash_nonrmale=req.body.wash_nonrmale;
                t.wash_nonrfemale=req.body.wash_nonrfemale;
                t.bath_restaurantmale=req.body.bath_restaurantmale;
                t.bath_restaurantfemale=req.body.bath_restaurantfemale;
                t.bath_nonrmale=req.body.bath_nonrmale;
                t.bath_nonrfemale=req.body.bath_nonrfemale;

                t.cleaners_public=req.body.cleaners_public;
                t.kitchen_public=req.body.kitchen_public;
                t.cleanerssink_nonr=req.body.cleanerssink_nonr;
                t.kitchen_nonresident=req.body.kitchen_nonresident;

            break;

        // 6 . nurse_info 

            // case 'Secondary care hospital' :

            //     t.staffquarter_male=req.body.staffquarter_male;
            //     t.staffquarter_female=req.body.staffquarter_female;
            //     t.staffquarter_total=req.body.staffquarter_total;
            //     t.nursehome_male=req.body.nursehome_male;
            //     t.nursehome_female=req.body.nursehome_female;
            //     t.nursehome_total=req.body.nursehome_total;
            //     t.nurses_total=req.body.nurses_total;
            //     t.water_staffQuasmale=req.body.water_staffQuasmale;
            //     t.water_staffQuafemale=req.body.water_staffQuafemale;
            //     t.ablution_staffQuasmale=req.body.ablution_staffQuasmale;
            //     t.ablution_staffQuafemale=req.body.ablution_staffQuafemale;
            //     t.urinals_staffQuasmale=req.body.urinals_staffQuasmale;
            //     t.urinals_staffQuafemale=req.body.urinals_staffQuafemale;
            //     t.wash_staffQuasmale=req.body.wash_staffQuasmale;
            //     t.bath_staffQuasmale=req.body.bath_staffQuasmale;
            //     t.water_nursehomemale=req.body.water_nursehomemale;
            //     t.water_nursehomefemale=req.body.water_nursehomefemale;
            //     t.ablution_nursehomemale=req.body.ablution_nursehomemale;
            //     t.ablution_nursehomefemale=req.body.ablution_nursehomefemale;
            //     t.urinals_nursehomemale=req.body.urinals_nursehomemale;
            //     t.urinals_nursehomefemale=req.body.urinals_nursehomefemale;
            //     t.wash_nursehomemale=req.body.wash_nursehomemale;
            //     t.bath_nursehomemale=req.body.bath_nursehomemale;

            // break;

        // 7 . hotel_info

            case 'Hotels'  :
            case  'Starred Hotels' :


                t.hotel_publicmale=req.body.hotel_publicmale;
                t.hotel_publicfemale=req.body.hotel_publicfemale;
                t.hotel_nonrmale=req.body.hotel_nonrmale;
                t.hotel_nonrfemale=req.body.hotel_nonrfemale;
                t.hotel_occtotal=req.body.hotel_occtotal;
                t.hotel_pubtotal=req.body.hotel_pubtotal;
                t.hotel_nontotal=req.body.hotel_nontotal;
                t.water_hotelmale=req.body.water_hotelmale;
                t.water_hotelfemale=req.body.water_hotelfemale;
                t.ablution_hotelmale=req.body.ablution_hotelmale;
                t.ablution_hotelfemale=req.body.ablution_hotelfemale;
                t.urinals_hotelmale=req.body.urinals_hotelmale;
                t.urinals_hotelfemale=req.body.urinals_hotelfemale;
                t.wash_hotelmale=req.body.wash_hotelmale;
                t.wash_hotelfemale=req.body.wash_hotelfemale;
                t.bath_hotelmale=req.body.bath_hotelmale;
                t.hotel_watermale=req.body.hotel_watermale;
                t.hotel_waterfemale=req.body.hotel_waterfemale;
                t.hotel_ablutionmale=req.body.hotel_ablutionmale;
                t.hotel_ablutionfemale=req.body.hotel_ablutionfemale;
                t.hotel_urinalsmale=req.body.hotel_urinalsmale;
                t.hotel_urinalsfemale=req.body.hotel_urinalsfemale;
                t.hotel_washmale=req.body.hotel_washmale;
                t.hotel_washfemale=req.body.hotel_washfemale;
                t.hotel_bathmale=req.body.hotel_bathmale;
                t.hotel_bathfemale=req.body.hotel_bathfemale;

                t.cleaners_photel=req.body.cleaners_photel;
                t.kitchen_photel=req.body.kitchen_photel;
                t.cleaners_nonrhotel=req.body.cleaners_nonrhotel;
                t.kitchen_nonrhotel=req.body.kitchen_nonrhotel;

            break;

        // 8 . hospitaloutdoor_info 

            case 'Secondary care hospital' : 
            case 'Tertiary care hospital' :
            case 'Quaternary care hospital' :

                t.hosp_patientmale=req.body.hosp_patientmale;
                t.hosp_patientfemale=req.body.hosp_patientfemale;
                t.hosp_staffmale=req.body.hosp_staffmale;
                t.hosp_stafffemale=req.body.hosp_stafffemale;
                t.hosp_patienttotal=req.body.hosp_patienttotal;
                t.hosp_stafftotal=req.body.hosp_stafftotal;
                t.hosp_occutotal=req.body.hosp_occutotal;
                t.water_patientmale=req.body.water_patientmale;
                t.water_patientfemale=req.body.water_patientfemale;
                t.ablution_patientmale=req.body.ablution_patientmale;
                t.ablution_patientfemale=req.body.ablution_patientfemale;
                t.urinals_patientmale=req.body.urinals_patientmale;
                t.urinals_patientfemale=req.body.urinals_patientfemale;
                t.wash_patientfemale=req.body.wash_patientfemale;
                t.wash_patientmale=req.body.wash_patientmale;
                t.water_staffmale=req.body.water_staffmale;
                t.water_stafffemale=req.body.water_stafffemale;
                t.ablution_staffmale=req.body.ablution_staffmale;
                t.ablution_stafffemale=req.body.ablution_stafffemale;
                t.urinals_staffmale=req.body.urinals_staffmale;
                t.urinals_stafffemale=req.body.urinals_stafffemale;
                t.wash_staffmale=req.body.wash_staffmale;
                t.wash_stafffemale=req.body.wash_stafffemale;
                t.bath_patientmale=req.body.bath_patientmale;
                t.bath_patientfemale=req.body.bath_patientfemale;
                t.bath_staffmale=req.body.bath_staffmale;
                t.bath_stafffemale=req.body.bath_stafffemale;

                t.drinking_pout=req.body.drinking_pout;
                t.drinking_stout=req.body.drinking_stout;

            break;

        // 9 . cinema_info

            case 'Gymnasium' :
            case 'Table tennis room': 
            case  'Billiard room' :
            case 'Gaming rooms' :
            case 'Swimming pool' :
            case  'Theatres' :
            case 'Conventional hall' :

                t.cinema_publicmale=req.body.cinema_publicmale;
                t.cinema_publicfemale=req.body.cinema_publicfemale;      
                t.cinema_staffmale=req.body.cinema_staffmale;      
                t.cinema_stafffemale=req.body.cinema_stafffemale;      
                t.cinema_publictotal=req.body.cinema_publictotal;
                t.cinema_stafftotal=req.body.cinema_stafftotal;
                t.cinema_occutotal=req.body.cinema_occutotal;
                t.water_cinemale=req.body.water_cinemale;
                t.water_cinefemale=req.body.water_cinefemale;
                t.ablution_cinemale=req.body.ablution_cinemale;
                t.ablution_cinefemale=req.body.ablution_cinefemale;
                t.urinals_cinefemale=req.body.urinals_cinefemale;
                t.urinals_cinemale=req.body.urinals_cinemale;
                t.wash_cinemale=req.body.wash_cinemale;
                t.cinema_watermale=req.body.cinema_watermale;
                t.cinema_waterfemale=req.body.cinema_waterfemale;
                t.cinema_ablutionmale=req.body.cinema_ablutionmale;
                t.cinema_ablutionfemale=req.body.cinema_ablutionfemale;
                t.cinema_urinalsmale=req.body.cinema_urinalsmale;
                t.cinema_urinalsfemale=req.body.cinema_urinalsfemale;
                t.cinema_washmale=req.body.cinema_washmale;
                t.cinema_washfemale=req.body.cinema_washfemale;
                t.bath_cinemale=req.body.bath_cinemale;
                t.bath_cinefemale=req.body.bath_cinefemale;
                t.cinema_bathmale=req.body.cinema_bathmale;
                t.cinema_bathfemale=req.body.cinema_bathfemale;

                t.drinking_pcinema=req.body.drinking_pcinema;
                t.cleaners_pcinema=req.body.cleaners_pcinema;
                t.drinking_stcinema=req.body.drinking_stcinema;
                t.cleaners_stcinema=req.body.cleaners_stcinema;

            break;

        // 10 . hospitalindoor_info

            case 'Secondary care hospital' : 
            case 'Tertiary care hospital' :
            case 'Quaternary care hospital' :

                t.indoorpatient_male=req.body.indoorpatient_male;
                t.indoorpatient_female=req.body.indoorpatient_female;
                t.indoorpatient_total=req.body.indoorpatient_total;
                t.indoorstaff_male=req.body.indoorstaff_male;
                t.indoorstaff_female=req.body.indoorstaff_female;
                t.indoorstaff_total=req.body.indoorstaff_total;
                t.indoor_total=req.body.indoor_total;
                t.water_indoormale=req.body.water_indoormale;
                t.water_indoorfemale=req.body.water_indoorfemale;
                t.ablution_indoormale=req.body.ablution_indoormale;
                t.ablution_indoorfemale=req.body.ablution_indoorfemale;
                t.urinals_indoormale=req.body.urinals_indoormale;
                t.urinals_indoorfemale=req.body.urinals_indoorfemale;
                t.wash_indoormale=req.body.wash_indoormale;
                t.bath_indoormale=req.body.bath_indoormale;
                t.bath_indoorfemale=req.body.bath_indoorfemale;
                t.water_indoorstaffmale=req.body.water_indoorstaffmale;
                t.water_indoorstafffemale=req.body.water_indoorstafffemale;
                t.ablution_indoorstaffmale=req.body.ablution_indoorstaffmale;
                t.ablution_indoorstafffemale=req.body.ablution_indoorstafffemale;
                t.urinals_indoorstaffmale=req.body.urinals_indoorstaffmale;
                t.urinals_indoorstafffemale=req.body.urinals_indoorstafffemale;
                t.wash_indoorstaffmale=req.body.wash_indoorstaffmale;
                t.wash_indoorstafffemale=req.body.wash_indoorstafffemale;
                t.bath_indoorstaffmale=req.body.bath_indoorstaffmale;
                t.bath_indoorstafffemale=req.body.bath_indoorstafffemale;

                t.dirnking_patienthospital=req.body.dirnking_patienthospital;
                t.cleaners_patienthospital=req.body.cleaners_patienthospital;
                t.kitchen_hospital=req.body.kitchen_hospital;
                t.drinking_stoilet=req.body.drinking_stoilet;
                t.cleaners_stoilet=req.body.cleaners_stoilet;
                t.kitchen_stoilet=req.body.kitchen_stoilet;

            break;

        // 11 . factory_info

            case 'Factories' : 
            case 'Storage' :
            case 'Storage/warehouse, receiving and the like':

                t.factoryworkers_male=req.body.factoryworkers_male;
                t.factoryworkers_female=req.body.factoryworkers_female;
                t.factoryoffice_male=req.body.factoryoffice_male;
                t.factoryoffice_female=req.body.factoryoffice_female;
                t.factoryoffice_total=req.body.factoryoffice_total;
                t.factoryworkers_total=req.body.factoryworkers_total;
                t.factoryoccu_total=req.body.factoryoccu_total;
                t.office_watermale=req.body.office_watermale;
                t.office_waterfemale=req.body.office_waterfemale;
                t.office_ablutionmale=req.body.office_ablutionmale;
                t.office_ablutionfemale=req.body.office_ablutionfemale;
                t.office_urinalsmale=req.body.office_urinalsmale;
                t.office_urinalsfemale=req.body.office_urinalsfemale;
                t.office_washmale=req.body.office_washmale;
                t.office_washfemale=req.body.office_washfemale;
                t.office_bathmale=req.body.office_bathmale;
                t.office_bathfemale=req.body.office_bathfemale;
                t.workers_watermale=req.body.workers_watermale;
                t.workers_waterfemale=req.body.workers_waterfemale;
                t.workers_ablutionfemale=req.body.workers_ablutionfemale;
                t.workers_ablutionmale=req.body.workers_ablutionmale;
                t.workers_urinalsmale=req.body.workers_urinalsmale;
                t.workers_urinalsfemale=req.body.workers_urinalsfemale;
                t.workers_bathfemale=req.body.workers_bathfemale;
                t.workers_bathmale=req.body.workers_bathmale;
                t.workers_washmale=req.body.workers_washmale;
                t.workers_washfemale=req.body.workers_washfemale;

                t.drinking_office=req.body.drinking_office;
                t.cleaners_office=req.body.cleaners_office;
                t.drinking_workers=req.body.drinking_workers;
                t.cleaners_workers=req.body.cleaners_workers;
            break;

        // 12 . art_info

            case  'ArtGalleries' : 
            case 'Library' :
            case 'Museums' :
                t.artgallerypub_male=req.body.artgallerypub_male;
                t.artgallerypub_female=req.body.artgallerypub_female;
                t.artgallerypub_total=req.body.artgallerypub_total;
                t.artgallerystaff_male=req.body.artgallerystaff_male;
                t.artgallerystaff_female=req.body.artgallerystaff_female;
                t.artgallerystaff_total=req.body.artgallerystaff_total;
                t.artgallery_total=req.body.artgallery_total;
                t.wash_artgallerypubmale=req.body.wash_artgallerypubmale;
                t.wash_artgallerypubfemale=req.body.wash_artgallerypubfemale;
                t.ablution_artgallerypubmale=req.body.ablution_artgallerypubmale;
                t.ablution_artgallerypubfemale=req.body.ablution_artgallerypubfemale;
                t.urinals_artgallerypubmale=req.body.urinals_artgallerypubmale;
                t.urinals_artgallerypubfemale=req.body.urinals_artgallerypubfemale;
                t.water_artgallerypubmale=req.body.water_artgallerypubmale;
                t.water_artgallerypubfemale=req.body.water_artgallerypubfemale;
                t.bath_artgallerypubfemale=req.body.bath_artgallerypubfemale;
                t.bath_artgallerypubmale=req.body.bath_artgallerypubmale;
                t.water_artgallerystaffmale=req.body.water_artgallerystaffmale;
                t.water_artgallerystafffemale=req.body.water_artgallerystafffemale;
                t.ablution_artgallerystafffemale=req.body.ablution_artgallerystafffemale;
                t.ablution_artgallerystaffmale=req.body.ablution_artgallerystaffmale;
                t.urinals_artgallerystaffmale=req.body.urinals_artgallerystaffmale;
                t.urinals_artgallerystafffemale=req.body.urinals_artgallerystafffemale;
                t.wash_artgallerystaffmale=req.body.wash_artgallerystaffmale;
                t.wash_artgallerystafffemale=req.body.wash_artgallerystafffemale;
                t.bath_artgallerystaffmale=req.body.bath_artgallerystaffmale;
                t.bath_artgallerystafffemale=req.body.bath_artgallerystafffemale;

                t.drinking_sartgallery=req.body.drinking_sartgallery;
                t.cleaners_sartgallery=req.body.cleaners_sartgallery;
                t.drinking_partgallery=req.body.drinking_partgallery;
                t.cleaners_partgallery=req.body.cleaners_partgallery;

            break;

        // 13 . mall_info

            case 'Shopping mall' :

                t.shopping_staffmale=req.body.shopping_staffmale;
                t.shopping_stafffemale=req.body.shopping_stafffemale;
                t.shopping_publicmale=req.body.shopping_publicmale;
                t.shopping_publicfemale=req.body.shopping_publicfemale;
                t.shopping_stafftotal=req.body.shopping_stafftotal;
                t.shopping_publictotal=req.body.shopping_publictotal;
                t.shopping_occutotal=req.body.shopping_occutotal;
                t.shopping_watermale=req.body.shopping_watermale;
                t.shopping_waterfemale=req.body.shopping_waterfemale;
                t.shopping_ablutionmale=req.body.shopping_ablutionmale;
                t.shopping_ablutionfemale=req.body.shopping_ablutionfemale;
                t.shopping_urinalsmale=req.body.shopping_urinalsmale;
                t.shopping_urinalsfemale=req.body.shopping_urinalsfemale;
                t.shopping_washmale=req.body.shopping_washmale;
                t.shopping_washfemale=req.body.shopping_washfemale;
                t.shopping_bathmale=req.body.shopping_bathmale;
                t.shopping_bathfemale=req.body.shopping_bathfemale;
                t.shop_watermale=req.body.shop_watermale;
                t.shop_waterfemale=req.body.shop_waterfemale;
                t.shop_ablutionmale=req.body.shop_ablutionmale;
                t.shop_ablutionfemale=req.body.shop_ablutionfemale;
                t.shop_urinalsmale=req.body.shop_urinalsmale;
                t.shop_urinalsfemale=req.body.shop_urinalsfemale;
                t.shop_washmale=req.body.shop_washmale;
                t.shop_washfemale=req.body.shop_washfemale;
                t.shop_bathmale=req.body.shop_bathmale;
                t.shop_bathfemale=req.body.shop_bathfemale;

            break;

        // 14 . station_info

            case 'Junction Stations' :
            case 'Intermediate Stations' :
            case 'Terminal Stations' :
            case 'Bus Terminals' :
            case 'Domestic Airport' :
            case 'International Airport' :

                t.busjunction_male=req.body.busjunction_male;
                t.busjunction_female=req.body.busjunction_female;
                t.busjunction_total=req.body.busjunction_total;
                t.busstation_male=req.body.busstation_male;
                t.busstation_female=req.body.busstation_female;
                t.busstation_total=req.body.busstation_total;
                t.dia_male=req.body.dia_male;
                t.dia_female=req.body.dia_female;
                t.dia_total=req.body.dia_total;
                t.junctions_total=req.body.junctions_total;
                t.water_junctionmale=req.body.water_junctionmale;
                t.water_junctionfemale=req.body.water_junctionfemale;
                t.ablution_junctionmale=req.body.ablution_junctionmale;
                t.ablution_junctionfemale=req.body.ablution_junctionfemale;
                t.urinals_junctionfemale=req.body.urinals_junctionfemale;
                t.urinals_junctionmale=req.body.urinals_junctionmale;
                t.wash_junctionfemale=req.body.wash_junctionfemale;
                t.wash_junctionmale=req.body.wash_junctionmale;
                t.bath_junctionmale=req.body.bath_junctionmale;
                t.water_stationmale=req.body.water_stationmale;
                t.water_stationfemale=req.body.water_stationfemale;
                t.ablution_stationmale=req.body.ablution_stationmale;
                t.ablution_stationfemale=req.body.ablution_stationfemale;
                t.urinals_stationmale=req.body.urinals_stationmale;
                t.urinals_stationfemale=req.body.urinals_stationfemale;
                t.wash_stationmale=req.body.wash_stationmale;
                t.wash_stationfemale=req.body.wash_stationfemale;
                t.bath_stationmale=req.body.bath_stationmale;
                t.water_diamale=req.body.water_diamale;
                t.water_diafemale=req.body.water_diafemale;
                t.ablution_diamale=req.body.ablution_diamale;
                t.ablution_diafemale=req.body.ablution_diafemale;
                t.urinals_diamale=req.body.urinals_diamale;
                t.urinals_diafemale=req.body.urinals_diafemale;
                t.wash_diamale=req.body.wash_diamale;
                t.wash_diafemale=req.body.wash_diafemale;
                t.bath_diamale=req.body.bath_diamale;

                t.drinking_junction=req.body.drinking_junction;
                t.cleaners_junction=req.body.cleaners_junction;
                t.drinking_terminal=req.body.drinking_terminal;
                t.cleaners_terminal=req.body.cleaners_terminal;
                t.drinking_domestic=req.body.drinking_domestic;
                t.cleaners_domestic=req.body.cleaners_domestic;

            break;

        // 15 . office_info

            case 'Office' :

                t.office_male=req.body.office_male;
                t.office_female=req.body.office_female;
                t.office_total=req.body.office_total;
                t.offstaff_male=req.body.offstaff_male;
                t.offstaff_female=req.body.offstaff_female;
                t.offstaff_total=req.body.offstaff_total;
                t.water_officemale=req.body.water_officemale;
                t.water_officefemale=req.body.water_officefemale;
                t.ablution_officemale=req.body.ablution_officemale;
                t.ablution_officefemale=req.body.ablution_officefemale;
                t.urinals_officemale=req.body.urinals_officemale;
                t.urinals_officefemale=req.body.urinals_officefemale;
                t.wash_officemale=req.body.wash_officemale;
                t.wash_officefemale=req.body.wash_officefemale;
                t.bath_officemale=req.body.bath_officemale;
                t.bath_officefemale=req.body.bath_officefemale;
                t.water_offstaffmale=req.body.water_offstaffmale;
                t.water_offstafffemale=req.body.water_offstafffemale;
                t.ablution_offstaffmale=req.body.ablution_offstaffmale;
                t.ablution_offstafffemale=req.body.ablution_offstafffemale;
                t.urinals_offstaffmale=req.body.urinals_offstaffmale;
                t.urinals_offstafffemale=req.body.urinals_offstafffemale;
                t.wash_offstaffmale=req.body.wash_offstaffmale;
                t.wash_offstafffemale=req.body.wash_offstafffemale;
                t.bath_offstaffmale=req.body.bath_offstaffmale;
                t.bath_offstafffemale=req.body.bath_offstafffemale;

                t.cleaners_stoffice=req.body.cleaners_stoffice;
                t.drinking_poffice=req.body.drinking_poffice;
                t.cleaners_poffice=req.body.cleaners_poffice;
                t.drinking_stoffice=req.body.drinking_stoffice;

            break;

            // 16 . Residential

            case 'Single bedroom dwelling unit':
            case 'Double bedroom dwelling unit':
            case 'Triple bedroom dwelling unit':
            case 'Four bedroom dwelling unit' :
            case 'Lodging and rooming houses':
            case 'Apartment Houses':

                t.dwIndividual=req.body.dwIndividual;
                t.dwIndividual_total=req.body.dwIndividual_total;
                t.dwoIndividual=req.body.dwoIndividual;
                t.dwoIndividual_total=req.body.dwoIndividual_total;
                t.residential_total=req.body.residential_total;
                t.water_dwIndividual=req.body.water_dwIndividual;
                t.ablution_dwIndividual=req.body.ablution_dwIndividual;
                t.urinals_dwIndividual=req.body.urinals_dwIndividual;
                t.wash_dwIndividual=req.body.wash_dwIndividual;
                t.bath_dwIndividual=req.body.bath_dwIndividual;
                t.water_dwoIndividual=req.body.water_dwoIndividual;
                t.ablution_dwoIndividual=req.body.ablution_dwoIndividual;
                t.urinals_dwoIndividual=req.body.urinals_dwoIndividual;
                t.wash_dwoIndividual=req.body.wash_dwoIndividual;
                t.bath_dwoIndividual=req.body.bath_dwoIndividual;

                t.kitchen_wodwell=req.body.kitchen_wodwell;
                t.kitchen_wdwell=req.body.kitchen_wdwell;

            break;


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
                res.json('saved');
            }
        });
    });
});

router.get('/tfc/getdatas/:pid/:btype', function (req, res, next) {

                                                // schools 
    if (req.params.btype == 'Schools up to senior secondary level' || req.params.btype == 'All others/training institutions')
    {
        TFC.Project.aggregate([
            {$match:{"_id":ObjectId(req.params.pid)}},
            { $unwind:'$building_info' },
            {$match:{"building_info.building_type":req.params.btype}},
            {
                $group:
                {
                    _id: {'building_name':'$building_info.building_name','floor_name':'$building_info.floor_name','water_nursboys':'$building_info.water_nursboys','water_nonrboys':'$building_info.water_nonrboys','water_nonrgirls':'$building_info.water_nonrgirls','water_resboys':'$building_info.water_resboys','water_resgirls':'$building_info.water_resgirls','ablution_nursboys':'$building_info.ablution_nursboys','ablution_nonrboys':'$building_info.ablution_nonrboys','ablution_nonrgirls':'$building_info.ablution_nonrgirls','ablution_resboys':'$building_info.ablution_resboys','ablution_resgirls':'$building_info.ablution_resgirls','urinals_nursboys':'$building_info.urinals_nursboys','urinals_nonrboys':'$building_info.urinals_nonrboys','urinals_nonrgirls':'$building_info.urinals_nonrgirls','urinals_resboys':'$building_info.urinals_resboys','urinals_resgirls':'$building_info.urinals_resgirls','wash_nursboys':'$building_info.wash_nursboys','wash_nonrboys':'$building_info.wash_nonrboys','wash_nonrgirls':'$building_info.wash_nonrgirls','wash_resboys':'$building_info.wash_resboys','wash_resgirls':'$building_info.wash_resgirls','bath_nursboys':'$building_info.bath_nursboys','bath_nonrboys':'$building_info.bath_nonrboys','bath_nonrgirls':'$building_info.bath_nonrgirls','bath_resboys':'$building_info.bath_resboys','bath_resgirls':'$building_info.bath_resgirls','drinking_nursboys':'$building_info.drinking_nursboys','drinking_nonrboys':'$building_info.drinking_nonrboys','drinking_nonrgirls':'$building_info.drinking_nonrgirls','drinking_resboys':'$building_info.drinking_resboys','drinking_resgirls':'$building_info.drinking_resgirls','cleaners_nursery':'$building_info.cleaners_nursery','cleaners_nonr':'$building_info.cleaners_nonr','cleaners_res':'$building_info.cleaners_res'}
                }
            },
            {
                $project:
                {
                    _id:0,

                    building_name:'$_id.building_name',
                    floor_name:'$_id.floor_name',

                    water_nursboys:'$_id.water_nursboys',
                    water_nonrboys:'$_id.water_nonrboys',
                    water_nonrgirls:'$_id.water_nonrgirls',
                    water_resboys:'$_id.water_resboys',
                    water_resgirls:'$_id.water_resgirls',

                    ablution_nursboys:'$_id.ablution_nursboys',
                    ablution_nonrboys:'$_id.ablution_nonrboys',
                    ablution_nonrgirls:'$_id.ablution_nonrgirls',
                    ablution_resboys:'$_id.ablution_resboys',
                    ablution_resgirls:'$_id.ablution_resgirls',

                    urinals_nursboys:'$_id.urinals_nursboys',
                    urinals_nonrboys:'$_id.urinals_nonrboys',
                    urinals_nonrgirls:'$_id.urinals_nonrgirls',
                    urinals_resboys:'$_id.urinals_resboys',
                    urinals_resgirls:'$_id.urinals_resgirls',

                    wash_nursboys:'$_id.wash_nursboys',
                    wash_nonrboys:'$_id.wash_nonrboys',
                    wash_nonrgirls:'$_id.wash_nonrgirls',
                    wash_resboys:'$_id.wash_resboys',
                    wash_resgirls:'$_id.wash_resgirls',

                    bath_nursboys:'$_id.bath_nursboys',
                    bath_nonrboys:'$_id.bath_nonrboys',
                    bath_nonrgirls:'$_id.bath_nonrgirls',
                    bath_resboys:'$_id.bath_resboys',
                    bath_resgirls:'$_id.bath_resgirls',

                    drinking_nursboys:'$_id.drinking_nursboys',
                    drinking_nonrboys:'$_id.drinking_nonrboys',
                    drinking_nonrgirls:'$_id.drinking_nonrgirls',
                    drinking_resboys:'$_id.drinking_resboys',
                    drinking_resgirls:'$_id.drinking_resgirls',

                    cleaners_nursery:'$_id.cleaners_nursery',
                    cleaners_nonr:'$_id.cleaners_nonr',
                    cleaners_res:'$_id.cleaners_res'

                }
            },
            { 
                $sort : { water_nursboys : 1}
            }
          ], function (err, result) {
            if (err) {
                next(err);
            } 
            else 
            {
                var floorData=[];
                var projectData=[
                    {s_no:1,'particulars':'Water Closet','male':0,'female':0,'total':0},
                    {s_no:2,'particulars':'Ablution tab','male':0,'female':0,'total':0},
                    {s_no:3,'particulars':'Urinals','male':0,'female':0,'total':0},
                    {s_no:4,'particulars':'Wash basins','male':0,'female':0,'total':0},
                    {s_no:5,'particulars':'Bath Showers','male':0,'female':0,'total':0},
                    {s_no:6,'particulars':'Drinking Fountain','male':0,'female':0,'total':0},
                    {s_no:7,'particulars':'Cleaners sink','male':0,'female':0,'total':0}
                ]
                var s_no=1;
                result.forEach(function(item){

                    floorData.push({
                        's_no':s_no,
                        building_name:item.building_name ,
                        floor_name:item.floor_name,
                        occupancy_type:'Nursery',

                        male_closet:0,
                        female_closet:0,
                        total_closet:item.water_nursboys || 0 ,

                        male_ablution:0,
                        female_ablution : 0,
                        total_ablution:item.ablution_nursboys || 0 ,

                        male_urinals:0,
                        female_urinals:0,
                        total_urinals:item.urinals_nursboys || 0 ,

                        male_washbasins:0,
                        female_washbasins:0,
                        total_washbasins:item.wash_nursboys || 0 ,

                        male_bath:0,
                        female_bath:0,
                        total_bath:item.bath_nursboys || 0 ,

                        male_fountain:0,
                        female_fountain:0,
                        total_fountain:item.drinking_nursboys || 0 ,

                        male_cleaners:0,
                        female_cleaners:0,
                        total_cleaners:item.cleaners_nursery || 0 ,

                        male_kitchen:0,
                        female_kitchen:0,
                        total_kitchen:0
                        
                    },{
                        's_no':s_no+1,
                        building_name:item.building_name,
                        floor_name:item.floor_name,
                        occupancy_type:'Non Residential',
                        
                        male_closet:item.water_nonrboys || 0 ,
                        female_closet:item.water_nonrgirls || 0 ,
                        total_closet:item.water_nonrboys || 0  + item.water_nonrgirls || 0 ,

                        male_ablution:item.ablution_nonrboys || 0 ,
                        female_ablution : item.ablution_nonrgirls || 0 ,
                        total_ablution:item.ablution_nonrboys || 0  + item.ablution_nonrgirls || 0 ,

                        male_urinals:item.urinals_nonrboys || 0 ,
                        female_urinals:item.urinals_nonrgirls || 0 ,
                        total_urinals:item.urinals_nonrboys || 0  + item.urinals_nonrgirls || 0 ,

                        male_washbasins:item.wash_nonrboys || 0 ,
                        female_washbasins:item.wash_nonrgirls || 0 ,
                        total_washbasins:item.wash_nonrboys || 0  + item.wash_nonrgirls || 0 ,

                        male_bath:item.bath_nonrboys || 0 ,
                        female_bath:item.bath_nonrgirls || 0 ,
                        total_bath:item.bath_nonrboys || 0  + item.bath_nonrgirls || 0  ,

                        male_fountain:item.drinking_nonrboys || 0 ,
                        female_fountain:item.drinking_nonrgirls || 0 ,
                        total_fountain:item.drinking_nonrboys || 0  + item.drinking_nonrgirls || 0  ,

                        male_cleaners:0,
                        female_cleaners:0,
                        total_cleaners:item.cleaners_nonr || 0 ,

                        male_kitchen:0,
                        female_kitchen:0,
                        total_kitchen:0

                    },{
                        's_no':s_no+2,
                        building_name:item.building_name,
                        floor_name:item.floor_name,
                        occupancy_type:'Residential',

                        male_closet:item.water_resboys || 0 ,
                        female_closet:item.water_resgirls || 0 ,
                        total_closet:item.water_resboys || 0  + item.water_resgirls || 0  ,

                        male_ablution:item.ablution_resboys || 0 ,
                        female_ablution : item.ablution_resgirls || 0 ,
                        total_ablution:item.ablution_resboys || 0  + item.ablution_resgirls || 0 ,

                        male_urinals:item.urinals_resboys || 0 ,
                        female_urinals:item.urinals_resgirls || 0 ,
                        total_urinals:item.urinals_resboys || 0  + item.urinals_resgirls || 0 ,

                        male_washbasins:item.wash_resboys || 0 ,
                        female_washbasins:item.wash_resgirls || 0 ,
                        total_washbasins:item.wash_resboys || 0  + item.wash_resgirls || 0 ,

                        male_bath:item.bath_resboys || 0 ,
                        female_bath:item.bath_resgirls || 0 ,
                        total_bath:item.bath_resboys || 0  + item.bath_resgirls || 0  ,

                        male_fountain:item.drinking_resboys || 0 ,
                        female_fountain:item.drinking_resgirls || 0 ,
                        total_fountain:item.drinking_resboys || 0  + item.drinking_resgirls || 0  ,

                        male_cleaners:0,
                        female_cleaners:0,
                        total_cleaners:item.cleaners_res || 0 ,

                        male_kitchen:0,
                        female_kitchen:0,
                        total_kitchen:0

                    });

                    s_no=s_no+3;

                    projectData[0].male=projectData[0].male+item.water_nursboys || 0 + item.water_nonrboys || 0 + item.water_resboys || 0;

                    projectData[0].female=projectData[0].female + item.water_nursboys || 0  + item.water_nonrgirls || 0 + item.water_resgirls || 0;

                    projectData[0].total=projectData[0].total + item.water_nursboys || 0  + item.water_nonrboys || 0  + item.water_nonrgirls || 0  + item.water_resboys || 0  + item.water_resgirls || 0 ;

                    projectData[1].male=projectData[1].male+ item.ablution_nursboys || 0  + item.ablution_nonrboys || 0  + item.ablution_resboys || 0 ;

                    projectData[1].female=projectData[1].female+ item.ablution_nursboys || 0  + item.ablution_nonrgirls || 0  + item.ablution_resgirls || 0 ;

                    projectData[1].total=projectData[1].total +item.ablution_nursboys || 0  + item.ablution_nonrboys || 0  + item.ablution_nonrgirls || 0  + item.ablution_resboys || 0  + item.ablution_resgirls || 0 ;

                    projectData[2].male=projectData[2].male+ item.urinals_nursboys || 0  +  item.urinals_nonrboys || 0  + item.urinals_resboys || 0 ;

                    projectData[2].female=projectData[2].female+ item.urinals_nursboys || 0  +  item.urinals_nonrgirls || 0  + item.urinals_resgirls || 0 ;

                    projectData[2].total=projectData[2].total + item.urinals_nursboys || 0  +  item.urinals_nonrboys || 0  + item.urinals_resboys || 0  + item.urinals_nonrgirls || 0  + item.urinals_resgirls || 0  ;
                    
                    projectData[3].male=projectData[3].male+ item.wash_nursboys || 0  + item.wash_nonrboys || 0  + item.wash_resboys || 0 ;

                    projectData[3].female=projectData[3].female+ item.wash_nursboys + item.wash_nonrgirls + item.wash_resgirls;

                    projectData[3].total=projectData[3].total + item.wash_nursboys || 0  + item.wash_nonrboys || 0  + item.wash_resboys || 0  + item.wash_nonrgirls || 0  + item.wash_resgirls || 0 ;

                    projectData[4].male=projectData[4].male+ item.bath_nursboys || 0  + item.bath_nonrboys || 0  + item.bath_resboys || 0 ;

                    projectData[4].female=projectData[4].female+ item.bath_nursboys || 0  + item.bath_nonrgirls || 0  + item.bath_resgirls || 0 ;

                    projectData[4].total=projectData[4].total + item.bath_nursboys || 0  + item.bath_nonrboys || 0  + item.bath_resboys || 0  + item.bath_nonrgirls || 0  + item.bath_resgirls || 0 ;

                    projectData[5].male=projectData[5].male+ item.drinking_nursboys || 0  + item.drinking_nonrboys || 0  + item.drinking_resboys || 0 ;

                    projectData[5].female=projectData[5].female+ item.drinking_nursboys || 0  + item.drinking_nonrgirls || 0  + item.drinking_resgirls || 0 ;

                    projectData[5].total=projectData[5].total + item.drinking_nursboys || 0  +  item.drinking_nonrboys || 0  + item.drinking_resboys || 0  + item.drinking_nonrgirls || 0  + item.drinking_resgirls || 0 ;

                    projectData[6].male=projectData[6].male+0;

                    projectData[6].female=projectData[6].female+0;

                    projectData[6].total=projectData[6].total + item.cleaners_nursery || 0  + item.cleaners_nonr || 0  + item.cleaners_res || 0 ;
                })
                
                // res.json(projectData);

                res.status(201).json({
                    projectData:projectData,
                    floorreport:floorData
                });
            }
        });
    }
                                             // hostels 
    else if (req.params.btype == 'Dormitories' || req.params.btype == 'Homes for the aged' || req.params.btype == 'Orphanages' || req.params.btype == 'Penal and mental institutions' || req.params.btype == 'Custodial institutions')
    {
        TFC.Project.aggregate([
            {$match:{"_id":ObjectId(req.params.pid)}},
            { $unwind:'$building_info' },
            {$match:{"building_info.building_type":req.params.btype}},
            {
                $group:
                {
                    _id: {'building_name':'$building_info.building_name','floor_name':'$building_info.floor_name','water_residentmale':'$building_info.water_residentmale','water_residentfemale':'$building_info.water_residentfemale','water_nrmale':'$building_info.water_nrmale','water_nrfemale':'$building_info.water_nrfemale','water_vcrmale':'$building_info.water_vcrmale','water_vcrfemale':'$building_info.water_vcrfemale', 'ablution_residentmale':'$building_info.ablution_residentmale','ablution_residentfemale':'$building_info.ablution_residentfemale','ablution_nrmale':'$building_info.ablution_nrmale','ablution_nrfemale':'$building_info.ablution_nrfemale','ablution_vcrfemale':'$building_info.ablution_vcrfemale','ablution_vcrmale':'$building_info.ablution_vcrmale', 'urinals_residentmale':'$building_info.urinals_residentmale','urinals_residentfemale':'$building_info.urinals_residentfemale','urinals_nrmale':'$building_info.urinals_nrmale','urinals_nrfemale':'$building_info.urinals_nrfemale','urinals_vcrmale':'$building_info.urinals_vcrmale','urinals_vcrfemale':'$building_info.urinals_vcrfemale','wash_residentmale':'$building_info.wash_residentmale','wash_residentfemale':'$building_info.wash_residentfemale','wash_nrmale':'$building_info.wash_nrmale','wash_nrfemale':'$building_info.wash_nrfemale','wash_vcrmale':'$building_info.wash_vcrmale','wash_vcrfemale':'$building_info.wash_vcrfemale','bath_residentmale':'$building_info.bath_residentmale','bath_residentfemale':'$building_info.bath_residentfemale','bath_nrmale':'$building_info.bath_nrmale','bath_nrfemale':'$building_info.bath_nrfemale','bath_vcrmale':'$building_info.bath_vcrmale','bath_vcrfemale':'$building_info.bath_vcrfemale','cleaners_resident':'$building_info.cleaners_resident','cleaners_nonresident':'$building_info.cleaners_nonresident','cleaners_visitor':'$building_info.cleaners_visitor'}
                }
            },
            {
                $project:
                {
                    _id:0,

                    building_name:'$_id.building_name',
                    floor_name:'$_id.floor_name',

                    water_residentmale:'$_id.water_residentmale',
                    water_residentfemale:'$_id.water_residentfemale',
                    water_nrmale:'$_id.water_nrmale',
                    water_nrfemale:'$_id.water_nrfemale',
                    water_vcrmale:'$_id.water_vcrmale',
                    water_vcrfemale:'$_id.water_vcrfemale',

                    ablution_residentmale:'$_id.ablution_residentmale',
                    ablution_residentfemale:'$_id.ablution_residentfemale',
                    ablution_nrmale:'$_id.ablution_nrmale',
                    ablution_nrfemale:'$_id.ablution_nrfemale',
                    ablution_vcrfemale:'$_id.ablution_vcrfemale',
                    ablution_vcrmale:'$_id.ablution_vcrmale',
                    
                    urinals_residentmale:'$_id.urinals_residentmale',
                    urinals_residentfemale:'$_id.urinals_residentfemale',
                    urinals_nrmale:'$_id.urinals_nrmale',
                    urinals_nrfemale:'$_id.urinals_nrfemale',
                    urinals_vcrfemale:'$_id.urinals_vcrfemale',
                    urinals_vcrmale:'$_id.urinals_vcrmale',
                    
                    wash_residentmale:'$_id.wash_residentmale',
                    wash_residentfemale:'$_id.wash_residentfemale',
                    wash_nrmale:'$_id.wash_nrmale',
                    wash_nrfemale:'$_id.wash_nrfemale',
                    wash_vcrmale:'$_id.wash_vcrmale',
                    wash_vcrfemale:'$_id.wash_vcrfemale',
                    
                    bath_residentmale:'$_id.bath_residentmale',
                    bath_residentfemale:'$_id.bath_residentfemale',
                    bath_nrmale:'$_id.bath_nrmale',
                    bath_nrfemale:'$_id.bath_nrfemale',
                    bath_vcrmale:'$_id.bath_vcrmale',
                    bath_vcrfemale:'$_id.bath_vcrfemale',

                    cleaners_resident:'$_id.cleaners_resident',
                    cleaners_nonresident:'$_id.cleaners_nonresident',
                    cleaners_visitor:'$_id.cleaners_visitor'

                }
            },
            { 
                $sort : { water_residentmale : 1}
            }
          ], function (err, result) {
            if (err) {
                next(err);
            } 
            else 
            {
                
                var floorData =[];
                var projectData=[
                    {s_no:1,'particulars':'Water Closet','male':0,'female':0,'total':0},
                    {s_no:2,'particulars':'Ablution tab','male':0,'female':0,'total':0},
                    {s_no:3,'particulars':'Urinals','male':0,'female':0,'total':0},
                    {s_no:4,'particulars':'Wash basins','male':0,'female':0,'total':0},
                    {s_no:5,'particulars':'Bath Showers','male':0,'female':0,'total':0},
                    {s_no:6,'particulars':'Cleaners sink','male':0,'female':0,'total':0}
                ]

                var s_no=1;
                result.forEach(function(item){

                    floorData.push({
                        's_no':s_no,
                        building_name:item.building_name,
                        floor_name:item.floor_name,
                        occupancy_type:'Resident',

                        male_closet:item.water_residentmale || 0 ,
                        female_closet:item.water_residentfemale || 0 ,
                        total_closet:item.water_residentmale || 0  + item.water_residentfemale || 0 ,

                        male_ablution:item.ablution_residentmale || 0 ,
                        female_ablution : item.ablution_residentfemale || 0 ,
                        total_ablution:item.ablution_residentmale || 0  + item.ablution_residentfemale || 0 ,

                        male_urinals:item.urinals_residentmale || 0 ,
                        female_urinals:item.urinals_residentfemale || 0 ,
                        total_urinals:item.urinals_residentmale || 0  + item.urinals_residentfemale || 0 ,

                        male_washbasins:item.wash_residentmale || 0 ,
                        female_washbasins:item.wash_residentfemale || 0 ,
                        total_washbasins:item.wash_residentmale || 0  + item.wash_residentfemale || 0 ,

                        male_bath:item.bath_residentmale || 0 ,
                        female_bath:item.bath_residentfemale || 0 ,
                        total_bath:item.bath_residentmale || 0  + item.bath_residentfemale || 0 ,

                        male_fountain:0,
                        female_fountain:0,
                        total_fountain:0,

                        male_cleaners:0,
                        female_cleaners:0,
                        total_cleaners:item.cleaners_resident || 0 ,

                        male_kitchen:0,
                        female_kitchen:0,
                        total_kitchen:0
                        
                    },{
                        's_no':s_no+1,
                        building_name:item.building_name,
                        floor_name:item.floor_name,
                        occupancy_type:'Non Resident',
                        
                        male_closet:item.water_nrmale || 0 ,
                        female_closet:item.water_nrfemale || 0 ,
                        total_closet:item.water_nrmale || 0  + item.water_nrfemale || 0 ,

                        male_ablution:item.ablution_nrmale || 0 ,
                        female_ablution : item.ablution_nrfemale || 0 ,
                        total_ablution:item.ablution_nrmale || 0  + item.ablution_nrfemale || 0 ,

                        male_urinals:item.urinals_nrmale || 0 ,
                        female_urinals:item.urinals_nrfemale || 0 ,
                        total_urinals:item.urinals_nrmale || 0  + item.urinals_nrfemale || 0 ,

                        male_washbasins:item.wash_nrmale || 0 ,
                        female_washbasins:item.wash_nrfemale || 0 ,
                        total_washbasins:item.wash_nrmale || 0  + item.wash_nrfemale || 0 ,

                        male_bath:item.bath_nrmale || 0 ,
                        female_bath:item.bath_nrfemale || 0 ,
                        total_bath:item.bath_nrmale || 0  + item.bath_nrfemale || 0  ,

                        male_fountain:0,
                        female_fountain:0,
                        total_fountain:0 ,

                        male_cleaners:0,
                        female_cleaners:0,
                        total_cleaners:item.cleaners_nonresident || 0 ,

                        male_kitchen:0,
                        female_kitchen:0,
                        total_kitchen:0

                    },{
                        's_no':s_no+2,
                        building_name:item.building_name,
                        floor_name:item.floor_name,
                        occupancy_type:'Visitor (or) Common Rooms',

                        male_closet:item.water_vcrmale || 0 ,
                        female_closet:item.water_vcrfemale || 0 ,
                        total_closet:item.water_vcrmale || 0  + item.water_vcrfemale || 0  ,

                        male_ablution:item.ablution_vcrmale || 0 ,
                        female_ablution : item.ablution_vcrfemale || 0 ,
                        total_ablution:item.ablution_vcrmale || 0  + item.ablution_vcrfemale || 0 ,

                        male_urinals:item.urinals_vcrmale || 0 ,
                        female_urinals:item.urinals_vcrfemale || 0 ,
                        total_urinals:item.urinals_vcrmale || 0  + item.urinals_vcrfemale || 0 ,

                        male_washbasins:item.wash_vcrmale || 0 ,
                        female_washbasins:item.wash_vcrfemale || 0 ,
                        total_washbasins:item.wash_vcrmale || 0  + item.wash_vcrfemale || 0 ,

                        male_bath:item.bath_vcrmale || 0 ,
                        female_bath:item.bath_vcrfemale || 0 ,
                        total_bath:item.bath_vcrmale || 0  + item.bath_vcrfemale || 0  ,

                        male_fountain:0,
                        female_fountain:0,
                        total_fountain:0,

                        male_cleaners:0,
                        female_cleaners:0,
                        total_cleaners:item.cleaners_visitor || 0 ,

                        male_kitchen:0,
                        female_kitchen:0,
                        total_kitchen:0

                    });

                    s_no=s_no+3;

                    projectData[0].male=projectData[0].male+item.water_residentmale || 0  + item.water_nrmale || 0  + item.water_vcrmale || 0 ;

                    projectData[0].female=projectData[0].female + item.water_residentfemale || 0  + item.water_nrfemale || 0  + item.water_vcrfemale || 0 ;

                    projectData[0].total=projectData[0].total + item.water_residentmale || 0  + item.water_nrmale || 0  + item.water_vcrmale || 0  + item.water_residentfemale || 0  + item.water_nrfemale || 0  + item.water_vcrfemale || 0 ;

                    projectData[1].male=projectData[1].male+item.ablution_residentmale || 0  + item.ablution_nrmale || 0  + item.ablution_vcrmale || 0 ;

                    projectData[1].female=projectData[1].female + item.ablution_residentfemale || 0  + item.ablution_nrfemale || 0  + item.ablution_vcrfemale || 0 ;

                    projectData[1].total=projectData[1].total + item.ablution_residentmale || 0  + item.ablution_nrmale || 0  + item.ablution_vcrmale || 0  + item.ablution_residentfemale || 0  + item.ablution_nrfemale || 0  + item.ablution_vcrfemale || 0 ;

                    projectData[2].male=projectData[2].male+item.urinals_residentmale || 0  + item.urinals_nrmale || 0  + item.urinals_vcrmale || 0 ;

                    projectData[2].female=projectData[2].female + item.urinals_residentfemale || 0  + item.urinals_nrfemale || 0  + item.urinals_vcrfemale || 0 ;

                    projectData[2].total=projectData[2].total + item.urinals_residentmale || 0  + item.urinals_nrmale || 0  + item.urinals_vcrmale || 0  + item.urinals_residentfemale || 0  + item.urinals_nrfemale || 0  + item.urinals_vcrfemale || 0 ;
                    
                    projectData[3].male=projectData[3].male+item.wash_residentmale || 0  + item.wash_nrmale || 0  + item.wash_vcrmale || 0 ;

                    projectData[3].female=projectData[3].female + item.wash_residentfemale || 0  + item.wash_nrfemale || 0  + item.wash_vcrfemale || 0 ;

                    projectData[3].total=projectData[3].total + item.wash_residentmale || 0  + item.wash_nrmale || 0  + item.wash_vcrmale || 0  + item.wash_residentfemale || 0  + item.wash_nrfemale || 0  + item.wash_vcrfemale || 0 ;

                    projectData[4].male=projectData[4].male+ item.bath_residentmale || 0  + item.bath_nrmale || 0  + item.bath_vcrmale || 0 ;

                    projectData[4].female=projectData[4].female + item.bath_residentfemale || 0  + item.bath_nrfemale || 0  + item.bath_vcrfemale || 0 ;

                    projectData[4].total=projectData[4].total + item.bath_residentmale || 0  + item.bath_nrmale || 0  + item.bath_vcrmale || 0  + item.bath_residentfemale || 0  + item.bath_nrfemale || 0  + item.bath_vcrfemale || 0 ;

                    projectData[5].male=projectData[5].male+ 0;

                    projectData[5].female=projectData[5].female+ 0;

                    projectData[5].total=projectData[5].total + item.cleaners_resident || 0 + item.cleaners_nonresident || 0 + item.cleaners_visitor || 0;

                });

                // res.json(projectData);


                res.status(201).json({
                    projectData:projectData,
                    floorreport:floorData
                });
            }
        });
    }
                                          // restaurant 
    else if (req.params.btype == 'Dining areas and restaurants with seating and table' )
    {
        TFC.Project.aggregate([
            {$match:{"_id":ObjectId(req.params.pid)}},
            { $unwind:'$building_info' },
            {$match:{"building_info.building_type":req.params.btype}},
            {
                $group:
                {
                    _id: {'building_name':'$building_info.building_name','floor_name':'$building_info.floor_name','water_restaurantmale':'$building_info.water_restaurantmale','water_restaurantfemale':'$building_info.water_restaurantfemale','water_nonrmale':'$building_info.water_nonrmale','water_nonrfemale':'$building_info.water_nonrfemale','ablution_restaurantmale':'$building_info.ablution_restaurantmale','ablution_restaurantfemale':'$building_info.ablution_restaurantfemale','ablution_nonrmale':'$building_info.ablution_nonrmale','ablution_nonrfemale':'$building_info.ablution_nonrfemale','urinals_restaurantmale':'$building_info.urinals_restaurantmale','urinals_restaurantfemale':'$building_info.urinals_restaurantfemale','urinals_nonrmale':'$building_info.urinals_nonrmale','urinals_nonrfemale':'$building_info.urinals_nonrfemale','wash_restaurantmale':'$building_info.wash_restaurantmale','wash_restaurantfemale':'$building_info.wash_restaurantfemale','wash_nonrmale':'$building_info.wash_nonrmale','wash_nonrfemale':'$building_info.wash_nonrfemale','bath_restaurantmale':'$building_info.bath_restaurantmale','bath_restaurantfemale':'$building_info.bath_restaurantfemale','bath_nonrmale':'$building_info.bath_nonrmale','bath_nonrfemale':'$building_info.bath_nonrfemale','cleaners_public':'$building_info.cleaners_public','cleanerssink_nonr':'$building_info.cleanerssink_nonr','kitchen_public':'$building_info.kitchen_public','kitchen_nonresident':'$building_info.kitchen_nonresident'}
                }
            },
            {
                $project:
                {
                    _id:0,

                    building_name:'$_id.building_name',
                    floor_name:'$_id.floor_name',
                    
                    water_restaurantmale:'$_id.water_restaurantmale',
                    water_restaurantfemale:'$_id.water_restaurantfemale',
                    water_nonrmale:'$_id.water_nonrmale',
                    water_nonrfemale:'$_id.water_nonrfemale',

                    ablution_restaurantmale:'$_id.ablution_restaurantmale',
                    ablution_restaurantfemale:'$_id.ablution_restaurantfemale',
                    ablution_nonrmale:'$_id.ablution_nonrmale',
                    ablution_nonrfemale:'$_id.ablution_nonrfemale',

                    urinals_restaurantmale:'$_id.urinals_restaurantmale',
                    urinals_restaurantfemale:'$_id.urinals_restaurantfemale',
                    urinals_nonrmale:'$_id.urinals_nonrmale',
                    urinals_nonrfemale:'$_id.urinals_nonrfemale',
                    
                    wash_restaurantmale:'$_id.wash_restaurantmale',
                    wash_restaurantfemale:'$_id.wash_restaurantfemale',
                    wash_nonrmale:'$_id.wash_nonrmale',
                    wash_nonrfemale:'$_id.wash_nonrfemale',
                    
                    bath_restaurantmale:'$_id.bath_restaurantmale',
                    bath_restaurantfemale:'$_id.bath_restaurantfemale',
                    bath_nonrmale:'$_id.bath_nonrmale',
                    bath_nonrfemale:'$_id.bath_nonrfemale',
                    
                    cleaners_public:'$_id.cleaners_public',
                    cleanerssink_nonr:'$_id.cleanerssink_nonr',

                    kitchen_public:'$_id.kitchen_public',
                    kitchen_nonresident:'$_id.kitchen_nonresident'

                }
            },
            { 
                $sort : { water_restaurantmale : 1}
            }
          ], function (err, result) {
            if (err) {
                next(err);
            } 
            else 
            {
                var floorData =[];
                var projectData=[
                    {s_no:1,'particulars':'Water Closet','male':0,'female':0,'total':0},
                    {s_no:2,'particulars':'Ablution tab','male':0,'female':0,'total':0},
                    {s_no:3,'particulars':'Urinals','male':0,'female':0,'total':0},
                    {s_no:4,'particulars':'Wash basins','male':0,'female':0,'total':0},
                    {s_no:5,'particulars':'Bath Showers','male':0,'female':0,'total':0},
                    {s_no:6,'particulars':'Cleaners sink','male':0,'female':0,'total':0},
                    {s_no:7,'particulars':'Kitchen sink','male':0,'female':0,'total':0}
                ]
                var s_no = 1;
                result.forEach(function(item){

                    floorData.push({
                        's_no':s_no,
                        building_name:item.building_name,
                        floor_name:item.floor_name,
                        occupancy_type:'Public Rooms',

                        male_closet:item.water_restaurantmale || 0 ,
                        female_closet:item.water_restaurantfemale || 0 ,
                        total_closet:item.water_restaurantmale || 0  + item.water_restaurantfemale || 0 ,

                        male_ablution:item.ablution_restaurantmale || 0 ,
                        female_ablution : item.ablution_restaurantfemale || 0 ,
                        total_ablution:item.ablution_restaurantmale || 0  + item.ablution_restaurantfemale || 0 ,

                        male_urinals:item.urinals_restaurantmale || 0 ,
                        female_urinals:item.urinals_restaurantfemale || 0 ,
                        total_urinals:item.urinals_restaurantmale || 0  + item.urinals_restaurantfemale || 0 ,

                        male_washbasins:item.wash_restaurantmale || 0 ,
                        female_washbasins:item.wash_restaurantfemale || 0 ,
                        total_washbasins:item.wash_restaurantmale || 0  + item.wash_restaurantfemale || 0 ,

                        male_bath:item.bath_restaurantmale || 0 ,
                        female_bath:item.bath_restaurantfemale || 0 ,
                        total_bath:item.bath_restaurantmale || 0  + item.bath_restaurantfemale || 0 ,

                        male_fountain:0,
                        female_fountain:0,
                        total_fountain:0,

                        male_cleaners:0,
                        female_cleaners:0,
                        total_cleaners:item.cleaners_public || 0 ,

                        male_kitchen:0,
                        female_kitchen:0,
                        total_kitchen:item.kitchen_public || 0 
                        
                    },{
                        's_no':s_no+1,
                        building_name:item.building_name,
                        floor_name:item.floor_name,
                        occupancy_type:'Non Residential Staff',
                        
                        male_closet:item.water_nonrmale || 0 ,
                        female_closet:item.water_nonrfemale || 0 ,
                        total_closet:item.water_nonrmale || 0  + item.water_nonrfemale || 0 ,

                        male_ablution:item.ablution_nonrmale || 0 ,
                        female_ablution : item.ablution_nonrfemale || 0 ,
                        total_ablution:item.ablution_nonrmale || 0  + item.ablution_nonrfemale || 0 ,

                        male_urinals:item.urinals_nonrmale || 0 ,
                        female_urinals:item.urinals_nonrfemale || 0 ,
                        total_urinals:item.urinals_nonrmale || 0  + item.urinals_nonrfemale || 0 ,

                        male_washbasins:item.wash_nonrmale || 0 ,
                        female_washbasins:item.wash_nonrfemale || 0 ,
                        total_washbasins:item.wash_nonrmale || 0  + item.wash_nonrfemale || 0 ,

                        male_bath:item.bath_nonrmale || 0 ,
                        female_bath:item.bath_nonrfemale || 0 ,
                        total_bath:item.bath_nonrmale || 0  + item.bath_nonrfemale || 0  ,

                        male_fountain:0,
                        female_fountain:0,
                        total_fountain:0 ,

                        male_cleaners:0,
                        female_cleaners:0,
                        total_cleaners:item.cleanerssink_nonr || 0 ,

                        male_kitchen:0,
                        female_kitchen:0,
                        total_kitchen:item.kitchen_nonresident || 0 

                    });

                    s_no=s_no+2;

                    projectData[0].male=projectData[0].male+ item.water_restaurantmale || 0  + item.water_nonrmale || 0 ;

                    projectData[0].female=projectData[0].female + item.water_restaurantfemale || 0  + item.water_nonrfemale || 0 ;

                    projectData[0].total=projectData[0].total +item.water_restaurantmale || 0  + item.water_nonrmale || 0  + item.water_restaurantfemale || 0  + item.water_nonrfemale || 0 ;

                    projectData[1].male=projectData[1].male+item.ablution_restaurantmale || 0  + item.ablution_nonrmale || 0 ;

                    projectData[1].female=projectData[1].female + item.ablution_restaurantfemale || 0  + item.ablution_nonrfemale || 0 ;

                    projectData[1].total=projectData[1].total + item.ablution_restaurantmale || 0  + item.ablution_nonrmale || 0  + item.ablution_restaurantfemale || 0  + item.ablution_nonrfemale || 0 ;

                    projectData[2].male=projectData[2].male+item.urinals_restaurantmale || 0  + item.urinals_nonrmale || 0 ;

                    projectData[2].female=projectData[2].female + item.urinals_restaurantfemale || 0  + item.urinals_nonrfemale || 0 ;

                    projectData[2].total=projectData[2].total + item.urinals_restaurantmale || 0  + item.urinals_nonrmale || 0  + item.urinals_restaurantfemale || 0  + item.urinals_nonrfemale || 0 ;

                    projectData[3].male=projectData[3].male+item.wash_restaurantmale || 0  + item.wash_nonrmale || 0 ;

                    projectData[3].female=projectData[3].female + item.wash_restaurantfemale || 0  + item.wash_nonrfemale || 0 ;

                    projectData[3].total=projectData[3].total + item.wash_restaurantmale || 0  + item.wash_nonrmale || 0  + item.wash_restaurantfemale || 0  + item.wash_nonrfemale || 0 ;

                    projectData[4].male=projectData[4].male+item.bath_restaurantmale || 0  + item.bath_nonrmale || 0 ;

                    projectData[4].female=projectData[4].female + item.bath_restaurantfemale || 0  + item.bath_nonrfemale || 0 ;

                    projectData[4].total=projectData[4].total + item.bath_restaurantmale || 0  + item.bath_nonrmale || 0  + item.bath_restaurantfemale || 0  + item.bath_nonrfemale || 0 ;

                    projectData[5].male=projectData[5].male+0;

                    projectData[5].female=projectData[5].female+0;

                    projectData[5].total=projectData[5].total +  item.cleaners_public || 0  + item.cleanerssink_nonr || 0 ;

                    projectData[6].male=projectData[6].male+0;

                    projectData[6].female=projectData[6].female+0;

                    projectData[6].total=projectData[6].total + item.kitchen_public || 0  + item.kitchen_nonresident || 0 ;

                });

                // res.json(projectData);

                res.status(201).json({
                    projectData:projectData,
                    floorreport:floorData
                });
            }
        });
    }
                                          // hotels 
    else if (req.params.btype == 'Hotels'  || req.params.btype == 'Starred Hotels' )
    {
        TFC.Project.aggregate([
            {$match:{"_id":ObjectId(req.params.pid)}},
            { $unwind:'$building_info' },
            {$match:{"building_info.building_type":req.params.btype}},
            {
                $group:
                {
                    _id: {'building_name':'$building_info.building_name','floor_name':'$building_info.floor_name','water_hotelmale':'$building_info.water_hotelmale','water_hotelfemale':'$building_info.water_hotelfemale','hotel_watermale':'$building_info.hotel_watermale','hotel_waterfemale':'$building_info.hotel_waterfemale','ablution_hotelmale':'$building_info.ablution_hotelmale','ablution_hotelfemale':'$building_info.ablution_hotelfemale','hotel_ablutionmale':'$building_info.hotel_ablutionmale','hotel_ablutionfemale':'$building_info.hotel_ablutionfemale','urinals_hotelmale':'$building_info.urinals_hotelmale','urinals_hotelfemale':'$building_info.urinals_hotelfemale','hotel_urinalsmale':'$building_info.hotel_urinalsmale','hotel_urinalsfemale':'$building_info.hotel_urinalsfemale','wash_hotelmale':'$building_info.wash_hotelmale','wash_hotelfemale':'$building_info.wash_hotelfemale','hotel_washmale':'$building_info.hotel_washmale','hotel_washfemale':'$building_info.hotel_washfemale','bath_hotelmale':'$building_info.bath_hotelmale','hotel_bathmale':'$building_info.hotel_bathmale','hotel_bathfemale':'$building_info.hotel_bathfemale','cleaners_photel':'$building_info.cleaners_photel','cleaners_nonrhotel':'$building_info.cleaners_nonrhotel','kitchen_photel':'$building_info.kitchen_photel','kitchen_nonrhotel':'$building_info.kitchen_nonrhotel'}
                }
            },
            {
                $project:
                {
                    _id:0,
                    building_name:'$_id.building_name',
                    floor_name:'$_id.floor_name',

                    water_hotelmale:'$_id.water_hotelmale',
                    water_hotelfemale:'$_id.water_hotelfemale',
                    hotel_watermale:'$_id.hotel_watermale',
                    hotel_waterfemale:'$_id.hotel_waterfemale',

                    ablution_hotelmale:'$_id.ablution_hotelmale',
                    ablution_hotelfemale:'$_id.ablution_hotelfemale',
                    hotel_ablutionmale:'$_id.hotel_ablutionmale',
                    hotel_ablutionfemale:'$_id.hotel_ablutionfemale',

                    urinals_hotelmale:'$_id.urinals_hotelmale',
                    urinals_hotelfemale:'$_id.urinals_hotelfemale',
                    hotel_urinalsmale:'$_id.hotel_urinalsmale',
                    hotel_urinalsfemale:'$_id.hotel_urinalsfemale',

                    wash_hotelmale:'$_id.wash_hotelmale',
                    wash_hotelfemale:'$_id.wash_hotelfemale',
                    hotel_washmale:'$_id.hotel_washmale',
                    hotel_washfemale:'$_id.hotel_washfemale',

                    bath_hotelmale:'$_id.bath_hotelmale',
                    hotel_bathmale:'$_id.hotel_bathmale',
                    hotel_bathfemale:'$_id.hotel_bathfemale',

                    cleaners_photel:'$_id.cleaners_photel',
                    cleaners_nonrhotel:'$_id.cleaners_nonrhotel',

                    kitchen_photel:'$_id.kitchen_photel',
                    kitchen_nonrhotel:'$_id.kitchen_nonrhotel'

                }
            },
            { 
                $sort : { water_hotelmale : 1}
            }
          ], function (err, result) {
            if (err) {
                next(err);
            } 
            else 
            {
                var floorData = [];
                var projectData=[
                    {s_no:1,'particulars':'Water Closet','male':0,'female':0,'total':0},
                    {s_no:2,'particulars':'Ablution tab','male':0,'female':0,'total':0},
                    {s_no:3,'particulars':'Urinals','male':0,'female':0,'total':0},
                    {s_no:4,'particulars':'Wash basins','male':0,'female':0,'total':0},
                    {s_no:5,'particulars':'Bath Showers','male':0,'female':0,'total':0},
                    {s_no:6,'particulars':'Cleaners sink','male':0,'female':0,'total':0},
                    {s_no:7,'particulars':'Kitchen sink','male':0,'female':0,'total':0}
                ]
                
                var s_no = 1;
                result.forEach(function(item){

                    floorData.push({
                        's_no':s_no,
                        building_name:item.building_name,
                        floor_name:item.floor_name,
                        occupancy_type:'Public Rooms',

                        male_closet:item.water_hotelmale || 0 ,
                        female_closet:item.water_hotelfemale || 0 ,
                        total_closet:item.water_hotelmale || 0  + item.water_hotelfemale || 0 ,

                        male_ablution:item.ablution_hotelmale || 0 ,
                        female_ablution : item.ablution_hotelfemale || 0 ,
                        total_ablution:item.ablution_hotelmale || 0  + item.ablution_hotelfemale || 0 ,

                        male_urinals:item.urinals_hotelmale || 0 ,
                        female_urinals:item.urinals_hotelfemale || 0 ,
                        total_urinals:item.urinals_hotelmale || 0  + item.urinals_hotelfemale || 0 ,

                        male_washbasins:item.wash_hotelmale || 0 ,
                        female_washbasins:item.wash_hotelfemale || 0 ,
                        total_washbasins:item.wash_hotelmale || 0  + item.wash_hotelfemale || 0 , 

                        male_bath:0,
                        female_bath:0,
                        total_bath:item.bath_hotelmale || 0 ,

                        male_fountain:0,
                        female_fountain:0,
                        total_fountain:0,

                        male_cleaners:0,
                        female_cleaners:0,
                        total_cleaners:item.cleaners_photel || 0 ,

                        male_kitchen:0,
                        female_kitchen:0,
                        total_kitchen:item.kitchen_photel || 0 
                        
                    },{
                        's_no':s_no+1,
                        building_name:item.building_name,
                        floor_name:item.floor_name,
                        occupancy_type:'Non Residential Staff',
                        
                        male_closet:item.hotel_watermale || 0 ,
                        female_closet:item.hotel_waterfemale || 0 ,
                        total_closet:item.hotel_watermale || 0  + item.hotel_waterfemale || 0 ,

                        male_ablution:item.hotel_ablutionmale || 0 ,
                        female_ablution : item.hotel_ablutionfemale || 0 , 
                        total_ablution:item.hotel_ablutionmale || 0  + item.hotel_ablutionfemale || 0 ,

                        male_urinals:item.hotel_urinalsmale || 0 ,
                        female_urinals:item.hotel_urinalsfemale || 0 ,
                        total_urinals:item.hotel_urinalsmale || 0  + item.hotel_urinalsfemale || 0 ,

                        male_washbasins:item.hotel_washmale || 0 ,
                        female_washbasins:item.hotel_washfemale || 0 ,
                        total_washbasins:item.hotel_washmale || 0  + item.hotel_washfemale || 0 ,

                        male_bath:item.hotel_bathmale || 0 ,
                        female_bath:item.hotel_bathfemale || 0 ,
                        total_bath:item.hotel_bathmale || 0  + item.hotel_bathfemale || 0 ,

                        male_fountain:0,
                        female_fountain:0,
                        total_fountain:0 ,

                        male_cleaners:0,
                        female_cleaners:0,
                        total_cleaners:item.cleaners_nonrhotel || 0 ,

                        male_kitchen:0,
                        female_kitchen:0,
                        total_kitchen:item.kitchen_nonrhotel || 0 

                    });

                    s_no=s_no+2;

                    projectData[0].male=projectData[0].male+item.water_hotelmale || 0  + item.hotel_watermale || 0 ;
 
                    projectData[0].female=projectData[0].female +  item.water_hotelfemale || 0  + item.hotel_waterfemale || 0 ;
                   
                    projectData[0].total=projectData[0].total +item.water_hotelmale || 0  + item.hotel_watermale || 0  + item.water_hotelfemale || 0  + item.hotel_waterfemale || 0 ;

                    projectData[1].male=projectData[1].male+item.ablution_hotelmale || 0  + item.hotel_ablutionmale || 0 ;

                    projectData[1].female=projectData[1].female +  item.ablution_hotelfemale || 0  + item.hotel_ablutionfemale || 0 ;

                    projectData[1].total=projectData[1].total + item.ablution_hotelmale || 0  + item.hotel_ablutionmale || 0  + item.ablution_hotelfemale || 0  + item.hotel_ablutionfemale || 0 ;

                    projectData[2].male=projectData[2].male +item.urinals_hotelmale || 0  + item.hotel_urinalsmale || 0 ;

                    projectData[2].female=projectData[2].female + item.urinals_hotelfemale || 0  + item.hotel_urinalsfemale || 0 ;

                    projectData[2].total=projectData[2].total + item.urinals_hotelmale || 0  + item.hotel_urinalsmale || 0  + item.urinals_hotelfemale || 0  + item.hotel_urinalsfemale || 0 ;

                    projectData[3].male=projectData[3].male + item.wash_hotelmale || 0  + item.hotel_washmale || 0 ;

                    projectData[3].female=projectData[3].female +  item.wash_hotelfemale || 0  + item.hotel_washfemale || 0 ;

                    projectData[3].total=projectData[3].total + item.wash_hotelmale || 0  + item.hotel_washmale || 0  + item.wash_hotelfemale || 0  + item.hotel_washfemale || 0 ;

                    projectData[4].male=projectData[4].male + item.bath_hotelmale || 0  + item.hotel_bathmale || 0 ;

                    projectData[4].female=projectData[4].female + item.bath_hotelmale || 0  + item.hotel_bathfemale || 0 ;

                    projectData[4].total=projectData[4].total + item.bath_hotelmale || 0  + item.hotel_bathmale || 0  + item.hotel_bathfemale || 0  ;

                    projectData[5].male=projectData[5].male + 0;

                    projectData[5].female=projectData[5].female + 0;

                    projectData[5].total=projectData[5].total + item.cleaners_photel || 0 + item.cleaners_nonrhotel || 0;

                    projectData[6].male=projectData[6].male + 0;

                    projectData[6].female=projectData[6].female + 0;

                    projectData[6].total=projectData[6].total + item.kitchen_photel || 0 + item.kitchen_nonrhotel || 0;

                })

                // res.json(projectData);
                
                res.status(201).json({
                    projectData:projectData,
                    floorreport:floorData
                });
            }
        });
    }
                                                 // outdoor info 
    else if (req.params.btype == 'Secondary care hospital'|| req.params.btype == 'Tertiary care hospital'  || req.params.btype == 'Quaternary care hospital' )
    {
        TFC.Project.aggregate([
            {$match:{"_id":ObjectId(req.params.pid)}},
            { $unwind:'$building_info' },
            {$match:{"building_info.building_type":req.params.btype}},
            {
                $group:
                {
                    _id: {'building_name':'$building_info.building_name','floor_name':'$building_info.floor_name','water_patientmale':'$building_info.water_patientmale','water_patientfemale':'$building_info.water_patientfemale','water_staffmale':'$building_info.water_staffmale','water_stafffemale':'$building_info.water_stafffemale','ablution_patientmale':'$building_info.ablution_patientmale','ablution_patientfemale':'$building_info.ablution_patientfemale','ablution_staffmale':'$building_info.ablution_staffmale','ablution_stafffemale':'$building_info.ablution_stafffemale','urinals_patientmale':'$building_info.urinals_patientmale','urinals_patientfemale':'$building_info.urinals_patientfemale','urinals_staffmale':'$building_info.urinals_staffmale','urinals_stafffemale':'$building_info.urinals_stafffemale','wash_patientmale':'$building_info.wash_patientmale','wash_patientfemale':'$building_info.wash_patientfemale','wash_staffmale':'$building_info.wash_staffmale','wash_stafffemale':'$building_info.wash_stafffemale','bath_patientmale':'$building_info.bath_patientmale','bath_patientfemale':'$building_info.bath_patientfemale','bath_staffmale':'$building_info.bath_staffmale','bath_stafffemale':'$building_info.bath_stafffemale','drinking_pout':'$building_info.drinking_pout','drinking_stout':'$building_info.drinking_stout'}
                }
            },
            {
                $project:
                {
                    _id:0,

                    building_name:'$_id.building_name',
                    floor_name:'$_id.floor_name',

                    water_patientmale:'$_id.water_patientmale',
                    water_patientfemale:'$_id.water_patientfemale',
                    water_staffmale:'$_id.water_staffmale',
                    water_stafffemale:'$_id.water_stafffemale',

                    ablution_patientmale:'$_id.ablution_patientmale',
                    ablution_patientfemale:'$_id.ablution_patientfemale',
                    ablution_staffmale:'$_id.ablution_staffmale',
                    ablution_stafffemale:'$_id.ablution_stafffemale',

                    urinals_patientmale:'$_id.urinals_patientmale',
                    urinals_patientfemale:'$_id.urinals_patientfemale',
                    urinals_staffmale:'$_id.urinals_staffmale',
                    urinals_stafffemale:'$_id.urinals_stafffemale',

                    wash_patientfemale:'$_id.wash_patientfemale',
                    wash_patientmale:'$_id.wash_patientmale',
                    wash_staffmale:'$_id.wash_staffmale',
                    wash_stafffemale:'$_id.wash_stafffemale',

                    bath_patientmale:'$_id.bath_patientmale',
                    bath_patientfemale:'$_id.bath_patientfemale',
                    bath_staffmale:'$_id.bath_staffmale',
                    bath_stafffemale:'$_id.bath_stafffemale',

                    drinking_pout:'$_id.drinking_pout',
                    drinking_stout:'$_id.drinking_stout'


                }
            },
            { 
                $sort : { water_patientmale : 1}
            }
          ], function (err, result) {
            if (err) {
                next(err);
            } 
            else 
            {
               var floorData = [];
                var projectData=[
                    {s_no:1,'particulars':'Water Closet','male':0,'female':0,'total':0},
                    {s_no:2,'particulars':'Ablution tab','male':0,'female':0,'total':0},
                    {s_no:3,'particulars':'Urinals','male':0,'female':0,'total':0},
                    {s_no:4,'particulars':'Wash basins','male':0,'female':0,'total':0},
                    {s_no:5,'particulars':'Bath Showers','male':0,'female':0,'total':0},
                    {s_no:6,'particulars':'Drinking Fountain','male':0,'female':0,'total':0}
                ]
                var s_no = 1;
                result.forEach(function(item){

                    floorData.push({
                        's_no':s_no,
                        building_name:item.building_name,
                        floor_name:item.floor_name,
                        occupancy_type:'Patient Toilets',

                        male_closet:item.water_patientmale || 0 ,
                        female_closet:item.water_patientfemale || 0 ,
                        total_closet:item.water_patientmale || 0  + item.water_patientfemale || 0 ,

                        male_ablution:item.ablution_patientmale || 0 ,
                        female_ablution : item.ablution_patientfemale || 0 ,
                        total_ablution:item.ablution_patientmale || 0  + item.ablution_patientfemale || 0 ,

                        male_urinals:item.urinals_patientmale || 0 ,
                        female_urinals:item.urinals_patientfemale || 0 ,
                        total_urinals:item.urinals_patientmale || 0  + item.urinals_patientfemale || 0 ,

                        male_washbasins:item.wash_patientmale || 0 ,
                        female_washbasins:item.wash_patientfemale || 0 ,
                        total_washbasins:item.wash_patientmale || 0  + item.wash_patientfemale || 0 ,

                        male_bath:item.bath_patientmale || 0 ,
                        female_bath:item.bath_patientfemale || 0 ,
                        total_bath:item.bath_patientmale || 0  + item.bath_patientfemale || 0 ,

                        male_fountain:0,
                        female_fountain:0,
                        total_fountain:item.drinking_pout || 0 ,

                        male_cleaners:0,
                        female_cleaners:0,
                        total_cleaners:0,

                        male_kitchen:0,
                        female_kitchen:0,
                        total_kitchen:0
                        
                    },{
                        's_no':s_no+1,
                        building_name:item.building_name,
                        floor_name:item.floor_name,
                        occupancy_type:'Staff Toilets',
                        
                        male_closet:item.water_staffmale || 0 ,
                        female_closet:item.water_stafffemale || 0 ,
                        total_closet:item.water_staffmale || 0  + item.water_stafffemale || 0 ,

                        male_ablution:item.ablution_staffmale || 0 ,
                        female_ablution : item.ablution_stafffemale || 0 ,
                        total_ablution:item.ablution_staffmale || 0  + item.ablution_stafffemale || 0 ,

                        male_urinals:item.urinals_staffmale || 0 ,
                        female_urinals:item.urinals_stafffemale || 0 ,
                        total_urinals:item.urinals_staffmale || 0  + item.urinals_stafffemale || 0 ,

                        male_washbasins:item.wash_staffmale || 0 ,
                        female_washbasins:item.wash_stafffemale || 0 ,
                        total_washbasins:item.wash_staffmale || 0  + item.wash_stafffemale || 0 ,

                        male_bath:item.bath_staffmale || 0 ,
                        female_bath:item.bath_stafffemale || 0 ,
                        total_bath:item.bath_staffmale || 0  + item.bath_stafffemale || 0  ,

                        male_fountain:0,
                        female_fountain:0,
                        total_fountain: item.drinking_stout || 0 ,

                        male_cleaners:0,
                        female_cleaners:0,
                        total_cleaners:0,

                        male_kitchen:0,
                        female_kitchen:0,
                        total_kitchen:0

                    });

                    s_no=s_no+2;

                    projectData[0].male=projectData[0].male+ item.water_patientmale || 0  + item.water_staffmale || 0 ;

                    projectData[0].female=projectData[0].female + item.water_patientfemale || 0  + item.water_stafffemale || 0 ;

                    projectData[0].total=projectData[0].total +item.water_patientmale || 0  + item.water_staffmale || 0  + item.water_patientfemale || 0  + item.water_stafffemale || 0 ;

                    projectData[1].male=projectData[1].male+ item.ablution_patientmale || 0  + item.ablution_staffmale || 0 ;

                    projectData[1].female=projectData[1].female + item.ablution_patientfemale || 0  + item.ablution_stafffemale || 0 ;

                    projectData[1].total=projectData[1].total + item.ablution_patientmale || 0  + item.ablution_staffmale || 0  + item.ablution_patientfemale || 0  + item.ablution_stafffemale || 0 ;

                    projectData[2].male=projectData[2].male + item.urinals_patientmale || 0  + item.urinals_staffmale || 0 ;

                    projectData[2].female=projectData[2].female + item.urinals_patientfemale || 0  + item.urinals_stafffemale || 0 ;

                    projectData[2].total=projectData[2].total + item.urinals_patientmale || 0  + item.urinals_staffmale || 0  + item.urinals_patientfemale || 0  + item.urinals_stafffemale || 0 ;

                    projectData[3].male=projectData[3].male + item.wash_patientmale || 0  + item.wash_staffmale || 0 ;

                    projectData[3].female=projectData[3].female + item.wash_patientfemale || 0  + item.wash_stafffemale || 0 ;

                    projectData[3].total=projectData[3].total + item.wash_patientmale || 0  + item.wash_staffmale || 0  + item.wash_patientfemale || 0  + item.wash_stafffemale || 0 ;

                    projectData[4].male=projectData[4].male + item.bath_patientmale || 0  + item.bath_staffmale || 0 ;

                    projectData[4].female=projectData[4].female + item.bath_patientfemale || 0  + item.bath_stafffemale || 0 ;

                    projectData[4].total=projectData[4].total + item.bath_patientmale || 0  + item.bath_staffmale || 0  + item.bath_patientfemale || 0  + item.bath_stafffemale || 0 ;

                    projectData[5].male=projectData[5].male + 0;

                    projectData[5].female=projectData[5].female + 0;

                    projectData[5].total=projectData[5].total + item.drinking_pout || 0  + item.drinking_stout || 0 ;

                })

                // res.json(projectData);

                res.status(201).json({
                    projectData:projectData,
                    floorreport:floorData
                });
            }
        });
    }
                                              // cinema 
    else if (req.params.btype == 'Gymnasium'|| req.params.btype == 'Table tennis room'  || req.params.btype == 'Billiard room' || req.params.btype == 'Gaming rooms' || req.params.btype == 'Swimming pool' || req.params.btype == 'Theatres' || req.params.btype == 'Conventional hall' )
    {
        TFC.Project.aggregate([
            {$match:{"_id":ObjectId(req.params.pid)}},
            { $unwind:'$building_info' },
            {$match:{"building_info.building_type":req.params.btype}},
            {
                $group:
                {
                    _id: {'building_name':'$building_info.building_name','floor_name':'$building_info.floor_name','water_cinemale':'$building_info.water_cinemale','water_cinefemale':'$building_info.water_cinefemale','cinema_watermale':'$building_info.cinema_watermale','cinema_waterfemale':'$building_info.cinema_waterfemale','ablution_cinemale':'$building_info.ablution_cinemale','ablution_cinefemale':'$building_info.ablution_cinefemale','cinema_ablutionmale':'$building_info.cinema_ablutionmale','cinema_ablutionfemale':'$building_info.cinema_ablutionfemale','urinals_cinefemale':'$building_info.urinals_cinefemale','urinals_cinemale':'$building_info.urinals_cinemale','cinema_urinalsmale':'$building_info.cinema_urinalsmale','cinema_urinalsfemale':'$building_info.cinema_urinalsfemale','wash_cinemale':'$building_info.wash_cinemale','cinema_washmale':'$building_info.cinema_washmale','cinema_washfemale':'$building_info.cinema_washfemale','bath_cinemale':'$building_info.bath_cinemale','bath_cinefemale':'$building_info.bath_cinefemale','cinema_bathmale':'$building_info.cinema_bathmale','cinema_bathfemale':'$building_info.cinema_bathfemale','drinking_pcinema':'$building_info.drinking_pcinema','drinking_stcinema':'$building_info.drinking_stcinema','cleaners_pcinema':'$building_info.cleaners_pcinema','cleaners_stcinema':'$building_info.cleaners_stcinema'}
                }
            },
            {
                $project:
                {
                    _id:0,

                    building_name:'$_id.building_name',
                    floor_name:'$_id.floor_name',

                    water_cinemale:'$_id.water_cinemale',
                    water_cinefemale:'$_id.water_cinefemale',
                    cinema_watermale:'$_id.cinema_watermale',
                    cinema_waterfemale:'$_id.cinema_waterfemale',

                    ablution_cinemale:'$_id.ablution_cinemale',
                    ablution_cinefemale:'$_id.ablution_cinefemale',
                    cinema_ablutionmale:'$_id.cinema_ablutionmale',
                    cinema_ablutionfemale:'$_id.cinema_ablutionfemale',

                    urinals_cinefemale:'$_id.urinals_cinefemale',
                    urinals_cinemale:'$_id.urinals_cinemale',
                    cinema_urinalsmale:'$_id.cinema_urinalsmale',
                    cinema_urinalsfemale:'$_id.cinema_urinalsfemale',

                    wash_cinemale:'$_id.wash_cinemale',
                    cinema_washmale:'$_id.cinema_washmale',
                    cinema_washfemale:'$_id.cinema_washfemale',
                    
                    bath_cinemale:'$_id.bath_cinemale',
                    bath_cinefemale:'$_id.bath_cinefemale',
                    cinema_bathmale:'$_id.cinema_bathmale',
                    cinema_bathfemale:'$_id.cinema_bathfemale',

                    drinking_pcinema:'$_id.drinking_pcinema',
                    drinking_stcinema:'$_id.drinking_stcinema',

                    cleaners_pcinema:'$_id.cleaners_pcinema',
                    cleaners_stcinema:'$_id.cleaners_stcinema'
                   

                }
            },
            { 
                $sort : { water_cinemale : 1}
            }
          ], function (err, result) {
            if (err) {
                next(err);
            } 
            else 
            {
                var floorData = [];
                var projectData=[
                    {s_no:1,'particulars':'Water Closet','male':0,'female':0,'total':0},
                    {s_no:2,'particulars':'Ablution tab','male':0,'female':0,'total':0},
                    {s_no:3,'particulars':'Urinals','male':0,'female':0,'total':0},
                    {s_no:4,'particulars':'Wash basins','male':0,'female':0,'total':0},
                    {s_no:5,'particulars':'Bath Showers','male':0,'female':0,'total':0},
                    {s_no:6,'particulars':'Drinking fountain','male':0,'female':0,'total':0},
                    {s_no:7,'particulars':'Cleaners sink','male':0,'female':0,'total':0}
                ]

                var s_no = 1;
                result.forEach(function(item){

                    floorData.push({
                        's_no':s_no,
                        building_name:item.building_name,
                        floor_name:item.floor_name,
                        occupancy_type:'Public',

                        male_closet:item.water_cinemale || 0 ,
                        female_closet:item.water_cinefemale || 0 ,
                        total_closet:item.water_cinemale || 0  + item.water_cinefemale || 0 ,

                        male_ablution:item.ablution_cinemale || 0 ,
                        female_ablution : item.ablution_cinefemale || 0 ,
                        total_ablution:item.ablution_cinemale || 0  + item.ablution_cinefemale || 0 ,

                        male_urinals:item.urinals_cinemale || 0 ,
                        female_urinals:item.urinals_cinefemale || 0 ,
                        total_urinals:item.urinals_cinemale || 0  + item.urinals_cinefemale || 0 ,

                        male_washbasins:0,
                        female_washbasins:0,
                        total_washbasins:item.wash_cinemale || 0 ,

                        male_bath:item.bath_cinemale || 0 ,
                        female_bath:item.bath_cinefemale || 0 ,
                        total_bath:item.bath_cinemale || 0  + item.bath_cinefemale || 0 ,

                        male_fountain:0,
                        female_fountain:0,
                        total_fountain:item.drinking_pcinema || 0 ,

                        male_cleaners:0,
                        female_cleaners:0,
                        total_cleaners:item.cleaners_pcinema || 0 ,

                        male_kitchen:0,
                        female_kitchen:0,
                        total_kitchen:0
                        
                    },{
                        's_no':s_no+1,
                        building_name:item.building_name,
                        floor_name:item.floor_name,
                        occupancy_type:'Staff',
                        
                        male_closet:item.cinema_watermale || 0 ,
                        female_closet:item.cinema_waterfemale || 0 ,
                        total_closet:item.cinema_watermale || 0  + item.cinema_waterfemale || 0 ,

                        male_ablution:item.cinema_ablutionmale || 0 ,
                        female_ablution : item.cinema_ablutionfemale || 0 ,
                        total_ablution:item.cinema_ablutionmale || 0  + item.cinema_ablutionfemale || 0 ,

                        male_urinals:item.cinema_urinalsmale || 0 ,
                        female_urinals:item.cinema_urinalsfemale || 0 ,
                        total_urinals:item.cinema_urinalsmale || 0  + item.cinema_urinalsfemale || 0 ,

                        male_washbasins:item.cinema_washmale || 0 ,
                        female_washbasins:item.cinema_washfemale || 0 ,
                        total_washbasins:item.cinema_washmale || 0  + item.cinema_washfemale || 0 ,

                        male_bath:item.cinema_bathmale || 0 ,
                        female_bath:item.cinema_bathfemale || 0 ,
                        total_bath:item.cinema_bathmale || 0  + item.cinema_bathfemale || 0  ,

                        male_fountain:0,
                        female_fountain:0,
                        total_fountain: item.drinking_stcinema || 0 ,

                        male_cleaners:0,
                        female_cleaners:0,
                        total_cleaners:item.cleaners_stcinema || 0 ,

                        male_kitchen:0,
                        female_kitchen:0,
                        total_kitchen:0

                    });

                    s_no=s_no+2;

                    projectData[0].male=projectData[0].male+ item.water_cinemale || 0  + item.cinema_watermale || 0 ;

                    projectData[0].female=projectData[0].female + item.water_cinefemale || 0  + item.cinema_waterfemale || 0 ;

                    projectData[0].total=projectData[0].total + item.water_cinemale || 0  + item.cinema_watermale || 0  + item.water_cinefemale || 0  + item.cinema_waterfemale || 0 ;

                    projectData[1].male=projectData[1].male+ item.ablution_cinemale || 0  + item.cinema_ablutionmale || 0 ;

                    projectData[1].female=projectData[1].female + item.ablution_cinefemale || 0  + item.cinema_ablutionfemale || 0 ;

                    projectData[1].total=projectData[1].total + item.ablution_cinemale || 0  + item.cinema_ablutionmale || 0  + item.ablution_cinefemale || 0  + item.cinema_ablutionfemale || 0 ;

                    projectData[2].male=projectData[2].male+ item.urinals_cinemale || 0  + item.cinema_urinalsmale || 0 ;

                    projectData[2].female=projectData[2].female + item.urinals_cinefemale || 0  + item.cinema_urinalsfemale || 0 ;

                    projectData[2].total=projectData[2].total + item.urinals_cinemale || 0  + item.cinema_urinalsmale || 0  + item.urinals_cinefemale || 0  + item.cinema_urinalsfemale || 0 ;

                    projectData[3].male=projectData[3].male+ item.wash_cinemale || 0  + item.cinema_washmale || 0 ;

                    projectData[3].female=projectData[3].female + item.cinema_washfemale || 0 ;

                    projectData[3].total=projectData[3].total + item.wash_cinemale || 0  + item.cinema_washmale || 0  + item.cinema_washfemale || 0 ;

                    projectData[4].male=projectData[4].male+ item.bath_cinemale || 0  + item.cinema_bathmale || 0 ;

                    projectData[4].female=projectData[4].female + item.bath_cinefemale || 0  + item.cinema_bathfemale || 0 ;

                    projectData[4].total=projectData[4].total + item.bath_cinemale || 0  + item.cinema_bathmale || 0  + item.bath_cinefemale || 0  + item.cinema_bathfemale || 0 ;

                    projectData[5].male=projectData[5].male + 0;

                    projectData[5].female=projectData[5].female + 0;

                    projectData[5].total=projectData[5].total + item.drinking_pcinema || 0 + item.drinking_stcinema || 0;

                    projectData[6].male=projectData[6].male + 0;

                    projectData[6].female=projectData[6].female + 0;

                    projectData[6].total=projectData[6].total + item.cleaners_pcinema || 0 + item.cleaners_stcinema || 0;

                })

                // res.json(projectData);
                
                res.status(201).json({
                    projectData:projectData,
                    floorreport:floorData
                });
            }
        });
    }
                                         // indoor info 
    else if (req.params.btype == 'Secondary care hospital'|| req.params.btype == 'Tertiary care hospital'  || req.params.btype == 'Quaternary care hospital'  )
    {
        TFC.Project.aggregate([
            {$match:{"_id":ObjectId(req.params.pid)}},
            { $unwind:'$building_info' },
            {$match:{"building_info.building_type":req.params.btype}},
            {
                $group:
                {
                    _id: {'building_name':'$building_info.building_name','floor_name':'$building_info.floor_name','water_indoormale':'$building_info.water_indoormale','water_indoorfemale':'$building_info.water_indoorfemale','water_indoorstaffmale':'$building_info.water_indoorstaffmale','water_indoorstafffemale':'$building_info.water_indoorstafffemale','ablution_indoormale':'$building_info.ablution_indoormale','ablution_indoorfemale':'$building_info.ablution_indoorfemale','ablution_indoorstaffmale':'$building_info.ablution_indoorstaffmale','ablution_indoorstafffemale':'$building_info.ablution_indoorstafffemale','urinals_indoormale':'$building_info.urinals_indoormale','urinals_indoorfemale':'$building_info.urinals_indoorfemale','urinals_indoorstaffmale':'$building_info.urinals_indoorstaffmale','urinals_indoorstafffemale':'$building_info.urinals_indoorstafffemale','wash_indoormale':'$building_info.wash_indoormale','wash_indoorstaffmale':'$building_info.wash_indoorstaffmale','wash_indoorstafffemale':'$building_info.wash_indoorstafffemale','bath_indoormale':'$building_info.bath_indoormale','bath_indoorfemale':'$building_info.bath_indoorfemale','bath_indoorstaffmale':'$building_info.bath_indoorstaffmale','bath_indoorstafffemale':'$building_info.bath_indoorstafffemale','dirnking_patienthospital':'$building_info.dirnking_patienthospital','drinking_stoilet':'$building_info.drinking_stoilet','cleaners_patienthospital':'$building_info.cleaners_patienthospital','cleaners_stoilet':'$building_info.cleaners_stoilet','kitchen_hospital':'$building_info.kitchen_hospital','kitchen_stoilet':'$building_info.kitchen_stoilet'}
                }
            },
            {
                $project:
                {
                    _id:0,

                    building_name:'$_id.building_name',
                    floor_name:'$_id.floor_name',

                    water_indoormale:'$_id.water_indoormale',
                    water_indoorfemale:'$_id.water_indoorfemale',
                    water_indoorstaffmale:'$_id.water_indoorstaffmale',
                    water_indoorstafffemale:'$_id.water_indoorstafffemale',

                    ablution_indoormale:'$_id.ablution_indoormale',
                    ablution_indoorfemale:'$_id.ablution_indoorfemale',
                    ablution_indoorstaffmale:'$_id.ablution_indoorstaffmale',
                    ablution_indoorstafffemale:'$_id.ablution_indoorstafffemale',

                    urinals_indoormale:'$_id.urinals_indoormale',
                    urinals_indoorfemale:'$_id.urinals_indoorfemale',
                    urinals_indoorstaffmale:'$_id.urinals_indoorstaffmale',
                    urinals_indoorstafffemale:'$_id.urinals_indoorstafffemale',

                    wash_indoormale:'$_id.wash_indoormale',
                    wash_indoorstaffmale:'$_id.wash_indoorstaffmale',
                    wash_indoorstafffemale:'$_id.wash_indoorstafffemale',
                   
                    bath_indoormale:'$_id.bath_indoormale',
                    bath_indoorfemale:'$_id.bath_indoorfemale',
                    bath_indoorstaffmale:'$_id.bath_indoorstaffmale',
                    bath_indoorstafffemale:'$_id.bath_indoorstafffemale',

                    dirnking_patienthospital:'$_id.dirnking_patienthospital',
                    drinking_stoilet:'$_id.drinking_stoilet',

                    cleaners_patienthospital:'$_id.cleaners_patienthospital',
                    cleaners_stoilet:'$_id.cleaners_stoilet',

                    kitchen_hospital:'$_id.kitchen_hospital',
                    kitchen_stoilet:'$_id.kitchen_stoilet'
                  
                }
            },
            { 
                $sort : { water_indoormale : 1}
            }
          ], function (err, result) {
            if (err) {
                next(err);
            } 
            else 
            {
                var floorData = [];
                var projectData=[
                    {s_no:1,'particulars':'Water Closet','male':0,'female':0,'total':0},
                    {s_no:2,'particulars':'Ablution tab','male':0,'female':0,'total':0},
                    {s_no:3,'particulars':'Urinals','male':0,'female':0,'total':0},
                    {s_no:4,'particulars':'Wash basins','male':0,'female':0,'total':0},
                    {s_no:5,'particulars':'Bath Showers','male':0,'female':0,'total':0},
                    {s_no:6,'particulars':'Drinking fountain','male':0,'female':0,'total':0},
                    {s_no:7,'particulars':'Cleaners sink','male':0,'female':0,'total':0},
                    {s_no:8,'particulars':'Kitchen sink','male':0,'female':0,'total':0}
                ]

                var s_no = 1;
                result.forEach(function(item){

                    floorData.push({
                        's_no':s_no,
                        building_name:item.building_name,
                        floor_name:item.floor_name,
                        occupancy_type:'Patient Toilets',

                        male_closet:item.water_indoormale || 0 ,
                        female_closet:item.water_indoorfemale || 0 ,
                        total_closet:item.water_indoormale || 0  + item.water_indoorfemale || 0 ,

                        male_ablution:item.ablution_indoormale || 0 ,
                        female_ablution : item.ablution_indoorfemale || 0 ,
                        total_ablution:item.ablution_indoormale || 0  + item.ablution_indoorfemale || 0 ,

                        male_urinals:item.urinals_indoormale || 0 ,
                        female_urinals:item.urinals_indoorfemale || 0 ,
                        total_urinals:item.urinals_indoormale || 0  + item.urinals_indoorfemale || 0 ,

                        male_washbasins:0,
                        female_washbasins:0,
                        total_washbasins:item.wash_indoormale || 0 ,

                        male_bath:item.bath_indoormale,
                        female_bath:item.bath_indoorfemale,
                        total_bath:item.bath_indoormale || 0  + item.bath_indoorfemale || 0 ,

                        male_fountain:0,
                        female_fountain:0,
                        total_fountain:item.dirnking_patienthospital || 0 ,

                        male_cleaners:0,
                        female_cleaners:0,
                        total_cleaners:item.cleaners_patienthospital || 0 ,

                        male_kitchen:0,
                        female_kitchen:0,
                        total_kitchen:item.kitchen_hospital || 0 
                        
                    },{
                        's_no':s_no+1,
                        building_name:item.building_name,
                        floor_name:item.floor_name,
                        occupancy_type:'Staff Toilets',
                        
                        male_closet:item.water_indoorstaffmale || 0 ,
                        female_closet:item.water_indoorstafffemale || 0 ,
                        total_closet:item.water_indoorstaffmale || 0  + item.water_indoorstafffemale || 0 ,

                        male_ablution:item.ablution_indoorstaffmale || 0 ,
                        female_ablution : item.ablution_indoorstafffemale || 0 ,
                        total_ablution:item.ablution_indoorstaffmale || 0  + item.ablution_indoorstafffemale || 0 ,

                        male_urinals:item.urinals_indoorstaffmale || 0 ,
                        female_urinals:item.urinals_indoorstafffemale || 0 ,
                        total_urinals:item.urinals_indoorstaffmale || 0  + item.urinals_indoorstafffemale || 0 ,

                        male_washbasins:item.wash_indoorstaffmale || 0 ,
                        female_washbasins:item.wash_indoorstafffemale || 0 ,
                        total_washbasins:item.wash_indoorstaffmale || 0  + item.wash_indoorstafffemale || 0 ,

                        male_bath:item.bath_indoorstaffmale || 0 ,
                        female_bath:item.bath_indoorstafffemale || 0 ,
                        total_bath:item.bath_indoorstaffmale || 0  + item.bath_indoorstafffemale || 0  ,

                        male_fountain:0,
                        female_fountain:0,
                        total_fountain: item.drinking_stoilet || 0 ,

                        male_cleaners:0,
                        female_cleaners:0,
                        total_cleaners:item.cleaners_stoilet || 0 ,

                        male_kitchen:0,
                        female_kitchen:0,
                        total_kitchen:item.kitchen_stoilet || 0 

                    });

                    s_no=s_no+2;

                    projectData[0].male=projectData[0].male+ item.water_indoormale || 0  + item.water_indoorstaffmale || 0 ;

                    projectData[0].female=projectData[0].female + item.water_indoorfemale || 0  + item.water_indoorstafffemale || 0 ;

                    projectData[0].total=projectData[0].total + item.water_indoormale || 0  + item.water_indoorstaffmale || 0  + item.water_indoorfemale || 0  + item.water_indoorstafffemale || 0 ; 

                    projectData[1].male=projectData[1].male+ item.ablution_indoormale || 0  + item.ablution_indoorstaffmale || 0 ;

                    projectData[1].female=projectData[1].female + item.ablution_indoorfemale || 0  + item.ablution_indoorstafffemale || 0 ;

                    projectData[1].total=projectData[1].total + item.ablution_indoormale || 0  + item.ablution_indoorstaffmale || 0  + item.ablution_indoorfemale || 0  + item.ablution_indoorstafffemale || 0 ;

                    projectData[2].male=projectData[2].male+  item.urinals_indoormale || 0  + item.urinals_indoorstaffmale || 0 ;

                    projectData[2].female=projectData[2].female + item.urinals_indoorfemale || 0  + item.urinals_indoorstafffemale || 0 ;

                    projectData[2].total=projectData[2].total + item.urinals_indoormale || 0  + item.urinals_indoorstaffmale || 0  + item.urinals_indoorfemale || 0  + item.urinals_indoorstafffemale || 0 ;

                    projectData[3].male=projectData[3].male+ item.wash_indoormale || 0  + item.wash_indoorstaffmale || 0 ;

                    projectData[3].female=projectData[3].female + item.wash_indoorstafffemale || 0  ;

                    projectData[3].total=projectData[3].total + item.wash_indoormale || 0  + item.wash_indoorstaffmale || 0  + item.wash_indoorstafffemale || 0 ;

                    projectData[4].male=projectData[4].male+ item.bath_indoormale || 0  + item.bath_indoorstaffmale || 0 ;

                    projectData[4].female=projectData[4].female + item.bath_indoorfemale || 0  + item.bath_indoorstafffemale || 0 ;

                    projectData[4].total=projectData[4].total + item.bath_indoormale || 0  + item.bath_indoorstaffmale || 0  + item.bath_indoorfemale || 0  + item.bath_indoorstafffemale || 0 ;

                    projectData[5].male=projectData[5].male+ 0;

                    projectData[5].female=projectData[5].female + 0;

                    projectData[5].total=projectData[5].total + item.dirnking_patienthospital || 0  + item.drinking_stoilet || 0 ;

                    projectData[6].male=projectData[6].male+ 0;

                    projectData[6].female=projectData[6].female + 0;

                    projectData[6].total=projectData[6].total + item.cleaners_patienthospital || 0  + item.cleaners_stoilet || 0 ;

                    projectData[7].male=projectData[7].male+ 0;

                    projectData[7].female=projectData[7].female + 0;

                    projectData[7].total=projectData[7].total + item.kitchen_hospital || 0  + item.kitchen_stoilet || 0 ;

                })

                // res.json(projectData);
                
                res.status(201).json({
                    projectData:projectData,
                    floorreport:floorData
                });
            }
        });
    }
                                        //  factories 
    else if (req.params.btype == 'Factories'|| req.params.btype == 'Storage'  || req.params.btype == 'Storage/warehouse, receiving and the like' )
    {
        TFC.Project.aggregate([
            {$match:{"_id":ObjectId(req.params.pid)}},
            { $unwind:'$building_info' },
            {$match:{"building_info.building_type":req.params.btype}},
            {
                $group:
                {
                    _id: {'building_name':'$building_info.building_name','floor_name':'$building_info.floor_name','office_watermale':'$building_info.office_watermale','office_waterfemale':'$building_info.office_waterfemale','workers_watermale':'$building_info.workers_watermale','workers_waterfemale':'$building_info.workers_waterfemale','office_ablutionmale':'$building_info.office_ablutionmale','office_ablutionfemale':'$building_info.office_ablutionfemale','workers_ablutionmale':'$building_info.workers_ablutionmale','workers_ablutionfemale':'$building_info.workers_ablutionfemale','office_urinalsmale':'$building_info.office_urinalsmale','office_urinalsfemale':'$building_info.office_urinalsfemale','workers_urinalsmale':'$building_info.workers_urinalsmale','workers_urinalsfemale':'$building_info.workers_urinalsfemale','office_washmale':'$building_info.office_washmale','office_washfemale':'$building_info.office_washfemale','workers_washmale':'$building_info.workers_washmale','workers_washfemale':'$building_info.workers_washfemale','office_bathmale':'$building_info.office_bathmale','office_bathfemale':'$building_info.office_bathfemale','workers_bathmale':'$building_info.workers_bathmale','workers_bathfemale':'$building_info.workers_bathfemale','drinking_office':'$building_info.drinking_office','drinking_workers':'$building_info.drinking_workers','cleaners_office':'$building_info.cleaners_office','cleaners_workers':'$building_info.cleaners_workers'}
                }
            },
            {
                $project:
                {
                    _id:0,

                    building_name:'$_id.building_name',
                    floor_name:'$_id.floor_name',

                    office_watermale:'$_id.office_watermale',
                    office_waterfemale:'$_id.office_waterfemale',
                    workers_watermale:'$_id.workers_watermale',
                    workers_waterfemale:'$_id.workers_waterfemale',

                    office_ablutionmale:'$_id.office_ablutionmale',
                    office_ablutionfemale:'$_id.office_ablutionfemale',
                    workers_ablutionfemale:'$_id.workers_ablutionfemale',
                    workers_ablutionmale:'$_id.workers_ablutionmale',

                    office_urinalsmale:'$_id.office_urinalsmale',
                    office_urinalsfemale:'$_id.office_urinalsfemale',
                    workers_urinalsmale:'$_id.workers_urinalsmale',
                    workers_urinalsfemale:'$_id.workers_urinalsfemale',

                    office_washmale:'$_id.office_washmale',
                    office_washfemale:'$_id.office_washfemale',
                    workers_washmale:'$_id.workers_washmale',
                    workers_washfemale:'$_id.workers_washfemale',

                    office_bathmale:'$_id.office_bathmale',
                    office_bathfemale:'$_id.office_bathfemale',
                    workers_bathmale:'$_id.workers_bathmale',
                    workers_bathfemale:'$_id.workers_bathfemale',

                    drinking_office:'$_id.drinking_office',
                    drinking_workers:'$_id.drinking_workers',

                    cleaners_office:'$_id.cleaners_office',
                    cleaners_workers:'$_id.cleaners_workers'
                  
                }
            },
            { 
                $sort : { office_watermale : 1}
            }
          ], function (err, result) {
            if (err) {
                next(err);
            } 
            else 
            {
                var floorData = [];
                var projectData=[
                    {s_no:1,'particulars':'Water Closet','male':0,'female':0,'total':0},
                    {s_no:2,'particulars':'Ablution tab','male':0,'female':0,'total':0},
                    {s_no:3,'particulars':'Urinals','male':0,'female':0,'total':0},
                    {s_no:4,'particulars':'Wash basins','male':0,'female':0,'total':0},
                    {s_no:5,'particulars':'Bath Showers','male':0,'female':0,'total':0},
                    {s_no:6,'particulars':'Drinking fountain','male':0,'female':0,'total':0},
                    {s_no:7,'particulars':'Cleaners sink','male':0,'female':0,'total':0}
                ]
                var s_no = 1;
                result.forEach(function(item){

                    floorData.push({
                        's_no':s_no,
                        building_name:item.building_name,
                        floor_name:item.floor_name,
                        occupancy_type:'Offices (or) Visitors',

                        male_closet:item.office_watermale || 0 ,
                        female_closet:item.office_waterfemale || 0 ,
                        total_closet:item.office_watermale || 0  + item.office_waterfemale || 0 ,

                        male_ablution:item.office_ablutionmale || 0 ,
                        female_ablution : item.office_ablutionfemale || 0 ,
                        total_ablution:item.office_ablutionmale || 0 + item.office_ablutionfemale || 0 ,

                        male_urinals:item.office_urinalsmale || 0 ,
                        female_urinals:item.office_urinalsfemale || 0 ,
                        total_urinals:item.office_urinalsmale || 0  + item.office_urinalsfemale || 0 ,

                        male_washbasins:item.office_washmale || 0 ,
                        female_washbasins:item.office_washfemale || 0 ,
                        total_washbasins:item.office_washmale || 0  + item.office_washfemale || 0 ,

                        male_bath:item.office_bathmale || 0 ,
                        female_bath:item.office_bathfemale || 0 ,
                        total_bath:item.office_bathmale || 0  + item.office_bathfemale || 0 ,

                        male_fountain:0,
                        female_fountain:0,
                        total_fountain:item.drinking_office || 0 ,

                        male_cleaners:0,
                        female_cleaners:0,
                        total_cleaners:item.cleaners_office || 0 ,

                        male_kitchen:0,
                        female_kitchen:0,
                        total_kitchen:0
                        
                    },{
                        's_no':s_no+1,
                        building_name:item.building_name,
                        floor_name:item.floor_name,
                        occupancy_type:'Workers',
                        
                        male_closet:item.workers_watermale || 0 ,
                        female_closet:item.workers_waterfemale || 0 ,
                        total_closet:item.workers_watermale || 0  + item.workers_waterfemale || 0 ,

                        male_ablution:item.workers_ablutionmale || 0 ,
                        female_ablution : item.workers_ablutionfemale || 0 ,
                        total_ablution:item.workers_ablutionmale || 0  + item.workers_ablutionfemale || 0 ,

                        male_urinals:item.workers_urinalsmale || 0 ,
                        female_urinals:item.workers_urinalsfemale || 0 , 
                        total_urinals:item.workers_urinalsmale || 0  + item.workers_urinalsfemale || 0 ,

                        male_washbasins:item.workers_washmale || 0 ,
                        female_washbasins:item.workers_washfemale || 0 ,
                        total_washbasins:item.workers_washmale || 0  + item.workers_washfemale || 0 ,

                        male_bath:item.workers_bathmale || 0 ,
                        female_bath:item.workers_bathfemale || 0 ,
                        total_bath:item.workers_bathmale || 0  + item.workers_bathfemale || 0  ,

                        male_fountain:0,
                        female_fountain:0,
                        total_fountain: item.drinking_workers || 0 ,

                        male_cleaners:0,
                        female_cleaners:0,
                        total_cleaners:item.cleaners_workers || 0 ,

                        male_kitchen:0,
                        female_kitchen:0,
                        total_kitchen:0

                    });

                    s_no=s_no+2;

                    projectData[0].male=projectData[0].male+ item.office_watermale || 0  + item.workers_watermale || 0 ;

                    projectData[0].female=projectData[0].female + item.office_waterfemale || 0  + item.workers_waterfemale || 0 ;

                    projectData[0].total=projectData[0].total + item.office_watermale || 0  + item.workers_watermale || 0  + item.office_waterfemale || 0  + item.workers_waterfemale || 0 ;

                    projectData[1].male=projectData[1].male+ item.office_ablutionmale || 0  + item.workers_ablutionmale || 0 ;

                    projectData[1].female=projectData[1].female + item.office_ablutionfemale || 0  + item.workers_ablutionfemale || 0 ;

                    projectData[1].total=projectData[1].total + item.office_ablutionmale || 0  + item.workers_ablutionmale || 0  + item.office_ablutionfemale || 0  + item.workers_ablutionfemale || 0 ;

                    projectData[2].male=projectData[2].male+ item.office_urinalsmale || 0  + item.workers_urinalsmale || 0 ;

                    projectData[2].female=projectData[2].female + item.office_urinalsfemale || 0  + item.workers_urinalsfemale || 0 ;

                    projectData[2].total=projectData[2].total + item.office_urinalsmale || 0  + item.workers_urinalsmale || 0  + item.office_urinalsfemale || 0  + item.workers_urinalsfemale || 0 ;

                    projectData[3].male=projectData[3].male+ item.office_washmale || 0  + item.workers_washmale || 0 ;

                    projectData[3].female=projectData[3].female + item.office_washfemale || 0  + item.workers_washfemale || 0 ;

                    projectData[3].total=projectData[3].total + item.office_washmale || 0  + item.workers_washmale || 0  + item.office_washfemale || 0  + item.workers_washfemale || 0 ;

                    projectData[4].male=projectData[4].male+ item.office_bathmale || 0  + item.workers_bathmale || 0 ;
                    
                    projectData[4].female=projectData[4].female + item.office_bathfemale || 0  + item.workers_bathfemale || 0 ;

                    projectData[4].total=projectData[4].total +  item.office_bathmale || 0  + item.workers_bathmale || 0  + item.office_bathfemale || 0  + item.workers_bathfemale || 0 ;

                    projectData[5].male=projectData[5].male+0;

                    projectData[5].female=projectData[5].female + 0;

                    projectData[5].total=projectData[5].total +  item.drinking_office || 0 + item.drinking_workers || 0;

                    projectData[6].male=projectData[6].male+0;

                    projectData[6].female=projectData[6].female + 0;

                    projectData[6].total=projectData[6].total +  item.cleaners_office || 0 + item.cleaners_workers || 0 ;

                })

                // res.json(projectData);

                
                res.status(201).json({
                    projectData:projectData,
                    floorreport:floorData
                });
            }
        });
    }

                                         // /    Art Galleries
    else if (req.params.btype == 'ArtGalleries'|| req.params.btype == 'Library'  || req.params.btype == 'Museums' )
    {
        TFC.Project.aggregate([
            {$match:{"_id":ObjectId(req.params.pid)}},
            { $unwind:'$building_info' },
            {
                $group:
                {
                    _id: {'building_name':'$building_info.building_name','floor_name':'$building_info.floor_name','water_artgallerypubmale':'$building_info.water_artgallerypubmale','water_artgallerypubfemale':'$building_info.water_artgallerypubfemale','water_artgallerystaffmale':'$building_info.water_artgallerystaffmale','water_artgallerystafffemale':'$building_info.water_artgallerystafffemale','ablution_artgallerypubmale':'$building_info.ablution_artgallerypubmale','ablution_artgallerypubfemale':'$building_info.ablution_artgallerypubfemale','ablution_artgallerystafffemale':'$building_info.ablution_artgallerystafffemale','ablution_artgallerystaffmale':'$building_info.ablution_artgallerystaffmale','urinals_artgallerypubmale':'$building_info.urinals_artgallerypubmale','urinals_artgallerypubfemale':'$building_info.urinals_artgallerypubfemale','urinals_artgallerystaffmale':'$building_info.urinals_artgallerystaffmale','urinals_artgallerystafffemale':'$building_info.urinals_artgallerystafffemale','wash_artgallerypubmale':'$building_info.wash_artgallerypubmale','wash_artgallerypubfemale':'$building_info.wash_artgallerypubfemale','wash_artgallerystaffmale':'$building_info.wash_artgallerystaffmale','wash_artgallerystafffemale':'$building_info.wash_artgallerystafffemale','bath_artgallerypubfemale':'$building_info.bath_artgallerypubfemale','bath_artgallerypubmale':'$building_info.bath_artgallerypubmale','bath_artgallerystaffmale':'$building_info.bath_artgallerystaffmale','bath_artgallerystafffemale':'$building_info.bath_artgallerystafffemale','drinking_sartgallery':'$building_info.drinking_sartgallery','drinking_partgallery':'$building_info.drinking_partgallery','cleaners_sartgallery':'$building_info.cleaners_sartgallery','cleaners_partgallery':'$building_info.cleaners_partgallery',}
                }
            },
            {
                $project:
                {
                    _id:0,

                    building_name:'$_id.building_name',
                    floor_name:'$_id.floor_name',

                    water_artgallerypubmale:'$_id.water_artgallerypubmale',
                    water_artgallerypubfemale:'$_id.water_artgallerypubfemale',
                    water_artgallerystaffmale:'$_id.water_artgallerystaffmale',
                    water_artgallerystafffemale:'$_id.water_artgallerystafffemale',

                    ablution_artgallerypubmale:'$_id.ablution_artgallerypubmale',
                    ablution_artgallerypubfemale:'$_id.ablution_artgallerypubfemale',
                    ablution_artgallerystafffemale:'$_id.ablution_artgallerystafffemale',
                    ablution_artgallerystaffmale:'$_id.ablution_artgallerystaffmale',

                    urinals_artgallerypubmale:'$_id.urinals_artgallerypubmale',
                    urinals_artgallerypubfemale:'$_id.urinals_artgallerypubfemale',
                    urinals_artgallerystaffmale:'$_id.urinals_artgallerystaffmale',
                    urinals_artgallerystafffemale:'$_id.urinals_artgallerystafffemale',

                    wash_artgallerypubmale:'$_id.wash_artgallerypubmale',
                    wash_artgallerypubfemale:'$_id.wash_artgallerypubfemale',
                    wash_artgallerystaffmale:'$_id.wash_artgallerystaffmale',
                    wash_artgallerystafffemale:'$_id.wash_artgallerystafffemale',

                    bath_artgallerypubfemale:'$_id.bath_artgallerypubfemale',
                    bath_artgallerypubmale:'$_id.bath_artgallerypubmale',
                    bath_artgallerystaffmale:'$_id.bath_artgallerystaffmale',
                    bath_artgallerystafffemale:'$_id.bath_artgallerystafffemale',

                    drinking_sartgallery:'$_id.drinking_sartgallery',
                    drinking_partgallery:'$_id.drinking_partgallery',

                    cleaners_sartgallery:'$_id.cleaners_sartgallery',
                    cleaners_partgallery:'$_id.cleaners_partgallery',
                }
            },
            { 
                $sort : { water_artgallerypubfemale : 1}
            }
          ], function (err, result) {
            if (err) {
                next(err);
            } 
            else 
            {
                var floorData = [];
                var projectData=[
                    {s_no:1,'particulars':'Water Closet','male':0,'female':0,'total':0},
                    {s_no:2,'particulars':'Ablution tab','male':0,'female':0,'total':0},
                    {s_no:3,'particulars':'Urinals','male':0,'female':0,'total':0},
                    {s_no:4,'particulars':'Wash basins','male':0,'female':0,'total':0},
                    {s_no:5,'particulars':'Bath Showers','male':0,'female':0,'total':0},
                    {s_no:6,'particulars':'Water Fountain','male':0,'female':0,'total':0},
                    {s_no:7,'particulars':'Cleaner Sink','male':0,'female':0,'total':0},
                ]

                var s_no = 1;
                result.forEach(function(item){

                    floorData.push({
                        's_no':s_no,
                        building_name:item.building_name,
                        floor_name:item.floor_name,
                        occupancy_type:'Public',

                        male_closet:item.water_artgallerypubmale || 0 ,
                        female_closet:item.water_artgallerypubfemale || 0 ,
                        total_closet:item.water_artgallerypubmale || 0  + item.water_artgallerypubfemale || 0 ,

                        male_ablution:item.ablution_artgallerypubmale || 0 ,
                        female_ablution : item.ablution_artgallerypubfemale || 0 ,
                        total_ablution:item.ablution_artgallerypubmale || 0  + item.ablution_artgallerypubfemale || 0 ,

                        male_urinals:item.urinals_artgallerypubmale || 0 ,
                        female_urinals:item.urinals_artgallerypubfemale || 0 ,
                        total_urinals:item.urinals_artgallerypubmale || 0  + item.urinals_artgallerypubfemale || 0 ,

                        male_washbasins:item.wash_artgallerypubmale || 0 ,
                        female_washbasins:item.wash_artgallerypubfemale || 0 ,
                        total_washbasins:item.wash_artgallerypubmale || 0  + item.wash_artgallerypubfemale || 0 ,

                        male_bath:item.bath_artgallerypubfemale || 0 ,
                        female_bath:item.bath_artgallerypubmale || 0 ,
                        total_bath:item.bath_artgallerypubfemale || 0  + item.bath_artgallerypubmale || 0 ,

                        male_fountain:0,
                        female_fountain:0,
                        total_fountain:item.drinking_partgallery || 0 ,

                        male_cleaners:0,
                        female_cleaners:0,
                        total_cleaners:item.cleaners_partgallery || 0 ,

                        male_kitchen:0,
                        female_kitchen:0,
                        total_kitchen:0
                        
                    },{
                        's_no':s_no+1,
                        building_name:item.building_name,
                        floor_name:item.floor_name,
                        occupancy_type:'Staff',
                        
                        male_closet:item.water_artgallerystaffmale || 0 ,
                        female_closet:item.water_artgallerystafffemale || 0 ,
                        total_closet:item.water_artgallerystaffmale || 0  + item.water_artgallerystafffemale || 0 ,

                        male_ablution:item.ablution_artgallerystaffmale || 0 ,
                        female_ablution : item.ablution_artgallerystafffemale || 0 ,
                        total_ablution:item.ablution_artgallerystaffmale || 0  + item.ablution_artgallerystafffemale || 0 ,

                        male_urinals:item.urinals_artgallerystaffmale || 0 ,
                        female_urinals:item.urinals_artgallerystafffemale || 0 ,
                        total_urinals:item.urinals_artgallerystaffmale || 0 + item.urinals_artgallerystafffemale || 0 ,

                        male_washbasins:item.wash_artgallerystaffmale || 0 ,
                        female_washbasins:item.wash_artgallerystafffemale || 0 ,
                        total_washbasins:item.wash_artgallerystaffmale || 0  + item.wash_artgallerystafffemale || 0 ,

                        male_bath:item.bath_artgallerystaffmale || 0 ,
                        female_bath:item.bath_artgallerystafffemale || 0 ,
                        total_bath:item.bath_artgallerystaffmale || 0  + item.bath_artgallerystafffemale || 0  ,

                        male_fountain:0,
                        female_fountain:0,
                        total_fountain: item.drinking_sartgallery || 0 ,

                        male_cleaners:0,
                        female_cleaners:0,
                        total_cleaners:item.cleaners_sartgallery || 0 ,

                        male_kitchen:0,
                        female_kitchen:0,
                        total_kitchen:0

                    });

                    s_no=s_no+2;

                    projectData[0].male=projectData[0].male+item.water_artgallerypubmale || 0  + item.water_artgallerystaffmale || 0 ;
                    
                    projectData[0].female=projectData[0].female+item.water_artgallerystafffemale || 0  + item.water_artgallerypubfemale || 0 ;
                   
                    projectData[0].total=projectData[0].total+item.water_artgallerypubmale || 0  + item.water_artgallerystaffmale || 0  + item.water_artgallerystafffemale || 0  + item.water_artgallerypubfemale || 0  ;
                    
                    projectData[1].male=projectData[1].male+ item.ablution_artgallerypubmale || 0  + item.ablution_artgallerystaffmale || 0 ;
                    
                    projectData[1].female=projectData[1].female+item.ablution_artgallerypubfemale || 0  + item.ablution_artgallerystafffemale || 0 ;
                   
                    projectData[1].total=projectData[1].total+item.ablution_artgallerypubmale || 0  + item.ablution_artgallerystaffmale || 0 +  item.ablution_artgallerypubfemale || 0  + item.ablution_artgallerystafffemale || 0 ;
                    
                    projectData[2].male=projectData[2].male+ item.urinals_artgallerypubmale || 0  + item.urinals_artgallerystaffmale || 0 ;
                    
                    projectData[2].female=projectData[2].female+item.urinals_artgallerypubfemale || 0  + item.urinals_artgallerystafffemale || 0 ;
                   
                    projectData[2].total=projectData[2].total+ item.urinals_artgallerypubmale || 0  + item.urinals_artgallerystaffmale || 0  +  item.urinals_artgallerypubfemale || 0  + item.urinals_artgallerystafffemale || 0 ;
                    
                    projectData[3].male=projectData[3].male+item.wash_artgallerypubmale || 0  + item.wash_artgallerystaffmale || 0 ;
                    
                    projectData[3].female=projectData[3].female+ item.wash_artgallerypubfemale || 0  + item.wash_artgallerystafffemale || 0 ;
                    
                    projectData[3].total=projectData[3].total+ item.wash_artgallerypubmale || 0  + item.wash_artgallerystaffmale || 0  + item.wash_artgallerypubfemale || 0  + item.wash_artgallerystafffemale || 0 ;
                    
                    projectData[4].male=projectData[4].male+ item.bath_artgallerypubmale || 0  + item.bath_artgallerystaffmale || 0  ;
                    
                    projectData[4].female=projectData[4].female+item.bath_artgallerypubfemale || 0  + item.bath_artgallerystafffemale || 0  ;
                   
                    projectData[4].total=projectData[4].total+item.bath_artgallerypubmale || 0  + item.bath_artgallerystaffmale || 0  +item.bath_artgallerypubfemale || 0  + item.bath_artgallerystafffemale || 0 ;
                   
                    projectData[5].male=projectData[5].male+ 0;
                    projectData[5].female=projectData[5].female+0;
                    projectData[5].total=projectData[5].total+item.drinking_sartgallery || 0  + item.drinking_partgallery || 0 ;

                    projectData[6].male=projectData[6].male+ 0;
                    projectData[6].female=projectData[6].female+0;
                    projectData[6].total=projectData[6].total+item.cleaners_sartgallery || 0  + item.cleaners_partgallery || 0 ;
               
                })

                // res.json(projectData);

                res.status(201).json({
                    projectData:projectData,
                    floorreport:floorData
                });

            }
        });
    }
                                        // shopping Mall
    else if (req.params.btype == 'Shopping mall' )
    {
        TFC.Project.aggregate([
            {$match:{"_id":ObjectId(req.params.pid)}},
            { $unwind:'$building_info' },
            {
                $group:
                {
                    _id: {'building_name':'$building_info.building_name','floor_name':'$building_info.floor_name','shopping_watermale':'$building_info.shopping_watermale','shopping_waterfemale':'$building_info.shopping_waterfemale','shop_watermale':'$building_info.shop_watermale','shop_waterfemale':'$building_info.shop_waterfemale','shopping_ablutionmale':'$building_info.shopping_ablutionmale','shopping_ablutionfemale':'$building_info.shopping_ablutionfemale','shop_ablutionmale':'$building_info.shop_ablutionmale','shop_ablutionfemale':'$building_info.shop_ablutionfemale','shopping_urinalsmale':'$building_info.shopping_urinalsmale','shopping_urinalsfemale':'$building_info.shopping_urinalsfemale','shop_urinalsmale':'$building_info.shop_urinalsmale','shop_urinalsfemale':'$building_info.shop_urinalsfemale','shopping_washmale':'$building_info.shopping_washmale','shopping_washfemale':'$building_info.shopping_washfemale','shop_washmale':'$building_info.shop_washmale','shop_washfemale':'$building_info.shop_washfemale','shopping_bathmale':'$building_info.shopping_bathmale','shopping_bathfemale':'$building_info.shopping_bathfemale','shop_bathmale':'$building_info.shop_bathmale','shop_bathfemale':'$building_info.shop_bathfemale'}
                }
            },
            {
                $project:
                {
                    _id:0,

                    building_name:'$_id.building_name',
                    floor_name:'$_id.floor_name',

                    shopping_watermale:'$_id.shopping_watermale',
                    shopping_waterfemale:'$_id.shopping_waterfemale',
                    shop_watermale:'$_id.shop_watermale',
                    shop_waterfemale:'$_id.shop_waterfemale',

                    shopping_ablutionmale:'$_id.shopping_ablutionmale',
                    shopping_ablutionfemale:'$_id.shopping_ablutionfemale',
                    shop_ablutionmale:'$_id.shop_ablutionmale',
                    shop_ablutionfemale:'$_id.shop_ablutionfemale',

                    shopping_urinalsmale:'$_id.shopping_urinalsmale',
                    shopping_urinalsfemale:'$_id.shopping_urinalsfemale',
                    shop_urinalsmale:'$_id.shop_urinalsmale',
                    shop_urinalsfemale:'$_id.shop_urinalsfemale',

                    shopping_bathmale:'$_id.shopping_bathmale',
                    shopping_bathfemale:'$_id.shopping_bathfemale',
                    shop_bathmale:'$_id.shop_bathmale',
                    shop_bathfemale:'$_id.shop_bathfemale',

                    shopping_washmale:'$_id.shopping_washmale',
                    shopping_washfemale:'$_id.shopping_washfemale',
                    shop_washmale:'$_id.shop_washmale',
                    shop_washfemale:'$_id.shop_washfemale',
                }
            },
            { 
                $sort : { shopping_waterfemale : 1}
            }
        ], function (err, result) {
            if (err) {
                next(err);
            } 
            else 
            {

                var floorData = [];
                var projectData=[
                    {s_no:1,'particulars':'Water Closet','male':0,'female':0,'total':0},
                    {s_no:2,'particulars':'Ablution tab','male':0,'female':0,'total':0},
                    {s_no:3,'particulars':'Urinals','male':0,'female':0,'total':0},
                    {s_no:4,'particulars':'Wash basins','male':0,'female':0,'total':0},
                    {s_no:5,'particulars':'Bath Showers','male':0,'female':0,'total':0},
                    
                ]

                var s_no = 1;
                result.forEach(function(item){

                    floorData.push({
                        's_no':s_no,
                        building_name:item.building_name,
                        floor_name:item.floor_name,
                        occupancy_type:'Staff Toilets in Shopping Building',

                        male_closet:item.shopping_watermale || 0 ,
                        female_closet:item.shopping_waterfemale || 0 ,
                        total_closet:item.shopping_watermale || 0  + item.shopping_waterfemale || 0 ,

                        male_ablution:item.shopping_ablutionmale || 0 ,
                        female_ablution : item.shopping_ablutionfemale || 0 ,
                        total_ablution:item.shopping_ablutionmale || 0  + item.shopping_ablutionfemale || 0 ,

                        male_urinals:item.shopping_urinalsmale || 0 ,
                        female_urinals:item.shopping_urinalsfemale || 0 ,
                        total_urinals:item.shopping_urinalsmale || 0  + item.shopping_urinalsfemale || 0 ,

                        male_washbasins:item.shopping_washmale || 0 ,
                        female_washbasins:item.shopping_washfemale || 0 ,
                        total_washbasins:item.shopping_washmale || 0  + item.shopping_washfemale || 0 ,

                        male_bath:item.shopping_bathmale || 0 ,
                        female_bath:item.shopping_bathfemale || 0 ,
                        total_bath:item.shopping_bathmale || 0  + item.shopping_bathfemale || 0 ,

                        male_fountain:0,
                        female_fountain:0,
                        total_fountain:0,

                        male_cleaners:0,
                        female_cleaners:0,
                        total_cleaners:0,

                        male_kitchen:0,
                        female_kitchen:0,
                        total_kitchen:0
                        
                    },{
                        's_no':s_no+1,
                        building_name:item.building_name,
                        floor_name:item.floor_name,
                        occupancy_type:'Public Toilets for floating population',
                        
                        male_closet:item.shop_watermale || 0 ,
                        female_closet:item.shop_waterfemale || 0 ,
                        total_closet:item.shop_watermale || 0  + item.shop_waterfemale || 0 ,

                        male_ablution:item.shop_ablutionmale || 0 ,
                        female_ablution : item.shop_ablutionfemale || 0 ,
                        total_ablution:item.shop_ablutionmale || 0  + item.shop_ablutionfemale || 0 ,

                        male_urinals:item.shop_urinalsmale || 0 ,
                        female_urinals:item.shop_urinalsfemale || 0 ,
                        total_urinals:item.shop_urinalsmale || 0  + item.shop_urinalsfemale || 0 ,

                        male_washbasins:item.shop_washmale || 0 ,
                        female_washbasins:item.shop_washfemale || 0 ,
                        total_washbasins:item.shop_washmale || 0  + item.shop_washfemale || 0 ,

                        male_bath:item.shop_bathmale || 0 ,
                        female_bath:item.shop_bathfemale || 0 ,
                        total_bath:item.shop_bathmale || 0  + item.shop_bathfemale || 0  ,

                        male_fountain:0,
                        female_fountain:0,
                        total_fountain:0,

                        male_cleaners:0,
                        female_cleaners:0,
                        total_cleaners:0,

                        male_kitchen:0,
                        female_kitchen:0,
                        total_kitchen:0

                    });

                    s_no=s_no+2;

                    projectData[0].male=projectData[0].male+item.shopping_watermale || 0  + item.shop_watermale || 0  ;
                   
                    projectData[0].female=projectData[0].female+item.shopping_waterfemale || 0  + item.shop_waterfemale || 0  ;
                    
                    projectData[0].total=projectData[0].total+ item.shopping_watermale || 0  + item.shop_watermale || 0  +  item.shopping_waterfemale || 0  + item.shop_waterfemale || 0  ;
                   
                    projectData[1].male=projectData[1].male+item.shopping_ablutionmale || 0  + item.shop_ablutionmale || 0 ;
                   
                    projectData[1].female=projectData[1].female+item.shopping_ablutionfemale || 0  + item.shop_ablutionfemale || 0 ;
                   
                    projectData[1].total=projectData[1].total+ item.shopping_ablutionmale || 0  + item.shop_ablutionmale || 0  +  item.shopping_ablutionfemale || 0  + item.shop_ablutionfemale || 0 ;
                   
                    projectData[2].male=projectData[2].male+ item.shopping_urinalsmale || 0  + item.shop_urinalsmale || 0  ;
                    
                    projectData[2].female=projectData[2].female+ item.shopping_urinalsfemale || 0  + item.shop_urinalsfemale || 0  ;
                    
                    projectData[2].total=projectData[2].total+ item.shopping_urinalsmale || 0  + item.shop_urinalsmale || 0  +  item.shopping_urinalsfemale || 0  + item.shop_urinalsfemale || 0  ;
                    
                    projectData[3].male=projectData[3].male+ item.shopping_washmale || 0  + item.shop_washmale || 0 ;
                    
                    projectData[3].female=projectData[3].female+  item.shopping_washfemale || 0  + item.shop_washfemale || 0 ;
                   
                    projectData[3].total=projectData[3].total+  item.shopping_washmale || 0  + item.shop_washmale || 0  +  item.shopping_washfemale || 0  + item.shop_washfemale || 0 ;
                    
                    projectData[4].male=projectData[4].male+  item.shopping_bathmale || 0  + item.shop_bathmale || 0 ;
                    
                    projectData[4].female=projectData[4].female+  item.shopping_bathfemale || 0  + item.shop_bathfemale || 0 ;
                   
                    projectData[4].total=projectData[4].total+item.shopping_bathmale || 0  + item.shop_bathmale || 0  + item.shopping_bathfemale || 0  + item.shop_bathfemale || 0 ;
                    
                })

                // res.json(projectData);

                res.status(201).json({
                    projectData:projectData,
                    floorreport:floorData
                });
                

            }
        });
    }

                                                        // Junction Station
   else if (req.params.btype == 'Junction Stations'|| req.params.btype == 'Intermediate Stations'  || req.params.btype == 'Terminal Stations' || req.params.btype == 'Bus Terminals' || req.params.btype == 'Domestic Airport' || req.params.btype == 'International Airport' )
   {
       TFC.Project.aggregate([
           {$match:{"_id":ObjectId(req.params.pid)}},
           { $unwind:'$building_info' },
           {
               $group:
               {
                   _id: {'building_name':'$building_info.building_name','floor_name':'$building_info.floor_name','water_junctionmale':'$building_info.water_junctionmale','water_stationmale':'$building_info.water_stationmale','water_diamale':'$building_info.water_diamale','water_junctionfemale':'$building_info.water_junctionfemale','water_stationfemale':'$building_info.water_stationfemale','water_diafemale':'$building_info.water_diafemale','ablution_junctionmale':'$building_info.ablution_junctionmale','ablution_junctionfemale':'$building_info.ablution_junctionfemale','ablution_stationmale':'$building_info.ablution_stationmale','ablution_stationfemale':'$building_info.ablution_stationfemale','ablution_diamale':'$building_info.ablution_diamale','ablution_diafemale':'$building_info.ablution_diafemale','urinals_junctionfemale':'$building_info.urinals_junctionfemale','urinals_junctionmale':'$building_info.urinals_junctionmale','urinals_stationmale':'$building_info.urinals_stationmale','urinals_stationfemale':'$building_info.urinals_stationfemale','urinals_diamale':'$building_info.urinals_diamale','urinals_diafemale':'$building_info.urinals_diafemale','wash_junctionfemale':'$building_info.wash_junctionfemale','wash_junctionmale':'$building_info.wash_junctionmale','wash_stationmale':'$building_info.wash_stationmale','wash_stationfemale':'$building_info.wash_stationfemale','wash_diamale':'$building_info.wash_diamale','wash_diafemale':'$building_info.wash_diafemale','bath_junctionmale':'$building_info.bath_junctionmale','bath_stationmale':'$building_info.bath_stationmale','bath_diamale':'$building_info.bath_diamale','drinking_junction':'$building_info.drinking_junction','drinking_domestic':'$building_info.drinking_domestic','drinking_terminal':'$building_info.drinking_terminal','cleaners_junction':'$building_info.cleaners_junction','cleaners_terminal':'$building_info.cleaners_terminal','cleaners_domestic':'$building_info.cleaners_domestic'}
               }
           },
           {
               $project:
               {
                   _id:0,

                   building_name:'$_id.building_name',
                   floor_name:'$_id.floor_name',

                   water_junctionmale:'$_id.water_junctionmale',
                   water_junctionfemale:'$_id.water_junctionfemale',
                   water_stationfemale:'$_id.water_stationfemale',
                   water_stationmale:'$_id.water_stationmale',
                   water_diamale:'$_id.water_diamale',
                   water_diafemale:'$_id.water_diafemale',

                   ablution_junctionmale:'$_id.ablution_junctionmale',
                   ablution_junctionfemale:'$_id.ablution_junctionfemale',
                   ablution_stationmale:'$_id.ablution_stationmale',
                   ablution_stationfemale:'$_id.ablution_stationfemale',
                   ablution_diamale:'$_id.ablution_diamale',
                   ablution_diafemale:'$_id.ablution_diafemale',

                   urinals_junctionmale:'$_id.urinals_junctionmale',
                   urinals_junctionfemale:'$_id.urinals_junctionfemale',
                   urinals_stationmale:'$_id.urinals_stationmale',
                   urinals_stationfemale:'$_id.urinals_stationfemale',
                   urinals_diamale:'$_id.urinals_diamale',
                   urinals_diafemale:'$_id.urinals_diafemale',

                   wash_junctionmale:'$_id.wash_junctionmale',
                   wash_junctionfemale:'$_id.wash_junctionfemale',
                   wash_stationmale:'$_id.wash_stationmale',
                   wash_stationfemale:'$_id.wash_stationfemale',
                   wash_diamale:'$_id.wash_diamale',
                   wash_diafemale:'$_id.wash_diafemale',

                   bath_diamale:'$_id.bath_diamale',
                   bath_stationmale:'$_id.bath_stationmale',
                   bath_junctionmale:'$_id.bath_junctionmale',

                   drinking_junction:'$_id.drinking_junction',
                   drinking_terminal:'$_id.drinking_terminal',
                   drinking_domestic:'$_id.drinking_domestic',

                   cleaners_junction:'$_id.cleaners_junction',
                   cleaners_terminal:'$_id.cleaners_terminal',
                   cleaners_domestic:'$_id.cleaners_domestic',


               }
           },
           { 
               $sort : { water_junctionmale : 1}
           }
         ], function (err, result) {
           if (err) {
               next(err);
           } 
           else 
           {
                var floorData = [];
                var projectData=[
                   {s_no:1,'particulars':'Water Closet','male':0,'female':0,'total':0},
                   {s_no:2,'particulars':'Ablution tab','male':0,'female':0,'total':0},
                   {s_no:3,'particulars':'Urinals','male':0,'female':0,'total':0},
                   {s_no:4,'particulars':'Wash basins','male':0,'female':0,'total':0},
                   {s_no:5,'particulars':'Bath Showers','male':0,'female':0,'total':0},
                   {s_no:6,'particulars':'Drinking Fountain','male':0,'female':0,'total':0},
                   {s_no:7,'particulars':'Cleaners sink','male':0,'female':0,'total':0}
               ]

               var s_no = 1;
               result.forEach(function(item){

                floorData.push({
                    's_no':s_no,
                    building_name:item.building_name,
                    floor_name:item.floor_name,
                    occupancy_type:'Junction,Intermediate and Bus Stations',

                    male_closet:item.water_junctionmale || 0 ,
                    female_closet:item.water_junctionfemale || 0 ,
                    total_closet:item.water_junctionmale || 0  + item.water_junctionfemale || 0 ,

                    male_ablution:item.ablution_junctionmale || 0 ,
                    female_ablution : item.ablution_junctionfemale || 0 ,
                    total_ablution:item.ablution_junctionmale || 0  + item.ablution_junctionfemale || 0 ,

                    male_urinals:item.urinals_junctionmale || 0 ,
                    female_urinals:item.urinals_junctionfemale || 0 ,
                    total_urinals:item.urinals_junctionmale || 0  + item.urinals_junctionfemale || 0 ,

                    male_washbasins:item.wash_junctionmale || 0 ,
                    female_washbasins:item.wash_junctionfemale || 0 ,
                    total_washbasins:item.wash_junctionmale || 0  + item.wash_junctionfemale || 0 ,

                    male_bath:0,
                    female_bath:0,
                    total_bath:item.bath_junctionmale || 0  ,

                    male_fountain:0,
                    female_fountain:0,
                    total_fountain:item.drinking_junction || 0 ,

                    male_cleaners:0,
                    female_cleaners:0,
                    total_cleaners:item.cleaners_junction || 0 ,

                    male_kitchen:0,
                    female_kitchen:0,
                    total_kitchen:0
                    
                },{
                    's_no':s_no+1,
                    building_name:item.building_name,
                    floor_name:item.floor_name,
                    occupancy_type:'Terminal Railway & Bus Stations',
                    
                    male_closet:item.water_stationmale || 0 ,
                    female_closet:item.water_stationfemale || 0 ,
                    total_closet:item.water_stationmale || 0  + item.water_stationfemale || 0 ,

                    male_ablution:item.ablution_stationmale || 0 ,
                    female_ablution : item.ablution_stationfemale || 0 ,
                    total_ablution:item.ablution_stationmale || 0  + item.ablution_stationfemale || 0 ,

                    male_urinals:item.urinals_stationmale || 0 ,
                    female_urinals:item.urinals_stationfemale || 0 ,
                    total_urinals:item.urinals_stationmale || 0  + item.urinals_stationfemale || 0 ,

                    male_washbasins:item.wash_stationmale || 0 ,
                    female_washbasins:item.wash_stationfemale || 0 ,
                    total_washbasins:item.wash_stationmale || 0 + item.wash_stationfemale || 0,

                    male_bath:0,
                    female_bath:0,
                    total_bath:item.bath_stationmale || 0,

                    male_fountain:0,
                    female_fountain:0,
                    total_fountain:item.drinking_terminal || 0,

                    male_cleaners:0,
                    female_cleaners:0,
                    total_cleaners:item.cleaners_terminal || 0,

                    male_kitchen:0,
                    female_kitchen:0,
                    total_kitchen:0

                },{
                    's_no':s_no+2,
                    building_name:item.building_name,
                    floor_name:item.floor_name,
                    occupancy_type:'Domestic & International Airport',

                    male_closet:item.water_diamale || 0,
                    female_closet:item.water_diafemale || 0,
                    total_closet:item.water_diamale || 0 + item.water_diafemale || 0 ,

                    male_ablution:item.ablution_diamale || 0,
                    female_ablution : item.ablution_diafemale || 0,
                    total_ablution:item.ablution_diamale || 0 + item.ablution_diafemale || 0,

                    male_urinals:item.urinals_diamale || 0,
                    female_urinals:item.urinals_diafemale || 0,
                    total_urinals:item.urinals_diamale || 0 + item.urinals_diafemale || 0,

                    male_washbasins:item.wash_diamale || 0, 
                    female_washbasins:item.wash_diafemale || 0,
                    total_washbasins:item.wash_diamale || 0 + item.wash_diafemale || 0,

                    male_bath:0,
                    female_bath:0,
                    total_bath:item.bath_diamale || 0 ,

                    male_fountain:0,
                    female_fountain:0,
                    total_fountain:item.drinking_domestic || 0,

                    male_cleaners:0,
                    female_cleaners:0,
                    total_cleaners:item.cleaners_domestic || 0,

                    male_kitchen:0,
                    female_kitchen:0,
                    total_kitchen:0

                });

                s_no=s_no+3;

                   projectData[0].male=projectData[0].male+ item.water_junctionmale || 0 + item.water_stationmale || 0 + item.water_diamale || 0;
                   
                   projectData[0].female=projectData[0].female+ item.water_junctionfemale || 0 + item.water_stationfemale || 0 + item.water_diafemale || 0;
                   
                   projectData[0].total=projectData[0].total+ item.water_junctionmale || 0 + item.water_stationmale || 0 + item.water_diamale || 0 + item.water_junctionfemale || 0 + item.water_stationfemale || 0 +item.water_diafemale || 0 ;
                   
                   projectData[1].male=projectData[1].male+  item.ablution_junctionmale || 0 + item.ablution_stationmale || 0 + item.ablution_diamale || 0;
                  
                   projectData[1].female=projectData[1].female+ item.ablution_junctionfemale || 0 + item.ablution_stationfemale || 0 + item.ablution_diafemale || 0;
                   
                   projectData[1].total=projectData[1].total+ item.ablution_junctionmale || 0 + item.ablution_stationmale || 0 + item.ablution_diamale || 0 +  item.ablution_junctionfemale || 0 + item.ablution_stationfemale || 0 + item.ablution_diafemale || 0;
                   
                   projectData[2].male=projectData[2].male+ item.urinals_junctionmale || 0 + item.urinals_stationmale || 0 + item.urinals_diamale || 0;
                   
                   projectData[2].female=projectData[2].female+item.urinals_junctionfemale || 0 + item.urinals_stationfemale || 0 + item.urinals_diafemale || 0;
                   
                   projectData[2].total=projectData[2].total+ item.urinals_junctionmale || 0 + item.urinals_stationmale || 0 + item.urinals_diamale || 0 + item.urinals_junctionfemale || 0 + item.urinals_stationfemale || 0 + item.urinals_diafemale || 0;
                  
                   projectData[3].male=projectData[3].male+ item.wash_junctionmale || 0 + item.wash_stationmale || 0 + item.wash_diamale || 0;
                   
                   projectData[3].female=projectData[3].female+ item.wash_junctionfemale || 0 + item.wash_stationfemale || 0 + item.wash_diafemale || 0;
                  
                   projectData[3].total=projectData[3].total+item.wash_junctionmale || 0 + item.wash_stationmale || 0 + item.wash_diamale || 0 +  item.wash_junctionfemale || 0 + item.wash_stationfemale || 0 + item.wash_diafemale || 0;
                   
                   projectData[4].male=projectData[4].male+ 0;
                   projectData[4].female=projectData[4].female+ 0;
                   projectData[4].total=projectData[4].total+ item.bath_junctionmale || 0 + item.bath_stationmale || 0 + item.bath_diamale || 0;
                  
                   projectData[5].male=projectData[5].male+ 0;
                   projectData[5].female=projectData[5].female+ 0;
                   projectData[5].total=projectData[5].total+ item.drinking_junction || 0 + item.drinking_terminal || 0 + item.drinking_domestic || 0;
                   
                   projectData[6].male=projectData[6].male+ 0;
                   projectData[6].female=projectData[6].female+ 0;
                   projectData[6].total=projectData[6].total+ item.cleaners_junction || 0 + item.cleaners_terminal || 0 + item.drinking_domestic || 0;
                  
               })

            //    res.json(projectData);

            res.status(201).json({
                projectData:projectData,
                floorreport:floorData
            });
              
           }
       });
   }

                                                        // Office
    else if (req.params.btype == 'Office' )
    {
        TFC.Project.aggregate([
            {$match:{"_id":ObjectId(req.params.pid)}},
            { $unwind:'$building_info' },
            {
                $group:
                {
                    _id: {'building_name':'$building_info.building_name','floor_name':'$building_info.floor_name','water_officemale':'$building_info.water_officemale','water_offstaffmale':'$building_info.water_offstaffmale','water_officefemale':'$building_info.water_officefemale','water_offstafffemale':'$building_info.water_offstafffemale','ablution_officemale':'$building_info.ablution_officemale','ablution_offstaffmale':'$building_info.ablution_offstaffmale','ablution_officefemale':'$building_info.ablution_officefemale','ablution_offstafffemale':'$building_info.ablution_offstafffemale','urinals_officemale':'$building_info.urinals_officemale','urinals_offstaffmale':'$building_info.urinals_offstaffmale','urinals_officefemale':'$building_info.urinals_officefemale','urinals_offstafffemale':'$building_info.urinals_offstafffemale','wash_officemale':'$building_info.wash_officemale','wash_offstaffmale':'$building_info.wash_offstaffmale','wash_officefemale':'$building_info.wash_officefemale','wash_offstafffemale':'$building_info.wash_offstafffemale','bath_officemale':'$building_info.bath_officemale','bath_offstaffmale':'$building_info.bath_offstaffmale','bath_officefemale':'$building_info.bath_officefemale','bath_offstafffemale':'$building_info.bath_offstafffemale','cleaners_stoffice':'$building_info.cleaners_stoffice','cleaners_poffice':'$building_info.cleaners_poffice','drinking_poffice':'$building_info.drinking_poffice','drinking_stoffice':'$building_info.drinking_stoffice'}
                }
            },
            {
                $project:
                {
                    _id:0,

                    building_name:'$_id.building_name',
                    floor_name:'$_id.floor_name',

                    water_officemale:'$_id.water_officemale',
                    water_offstaffmale:'$_id.water_offstaffmale',
                    water_officefemale:'$_id.water_officefemale',
                    water_offstafffemale:'$_id.water_offstafffemale',

                    ablution_officemale:'$_id.ablution_officemale',
                    ablution_offstaffmale:'$_id.ablution_offstaffmale',
                    ablution_officefemale:'$_id.ablution_officefemale',
                    ablution_offstafffemale:'$_id.ablution_offstafffemale',

                    urinals_officemale:'$_id.urinals_officemale',
                    urinals_offstaffmale:'$_id.urinals_offstaffmale',
                    urinals_officefemale:'$_id.urinals_officefemale',
                    urinals_offstafffemale:'$_id.urinals_offstafffemale',

                    wash_officemale:'$_id.wash_officemale',
                    wash_offstaffmale:'$_id.wash_offstaffmale',
                    wash_officefemale:'$_id.wash_officefemale',
                    wash_offstafffemale:'$_id.wash_offstafffemale',

                    bath_officemale:'$_id.bath_officemale',
                    bath_offstaffmale:'$_id.bath_offstaffmale',
                    bath_officefemale:'$_id.bath_officefemale',
                    bath_offstafffemale:'$_id.bath_offstafffemale',

                    cleaners_stoffice:'$_id.cleaners_stoffice',
                    cleaners_poffice:'$_id.cleaners_poffice',

                    drinking_poffice:'$_id.drinking_poffice',
                    drinking_stoffice:'$_id.drinking_stoffice',
                    
                }
            },
            { 
                $sort : { water_officemale : 1}
            }
          ], function (err, result) {
            if (err) {
                next(err);
            } 
            else 
            {
                var floorData = [];
                var projectData=[
                    {s_no:1,'particulars':'Water Closet','male':0,'female':0,'total':0},
                    {s_no:2,'particulars':'Ablution tab','male':0,'female':0,'total':0},
                    {s_no:3,'particulars':'Urinals','male':0,'female':0,'total':0},
                    {s_no:4,'particulars':'Wash basins','male':0,'female':0,'total':0},
                    {s_no:5,'particulars':'Bath Showers','male':0,'female':0,'total':0},
                    {s_no:6,'particulars':'Drinking Fountain','male':0,'female':0,'total':0},
                    {s_no:7,'particulars':'Cleaners sink','male':0,'female':0,'total':0}
                ]

                var s_no = 1;
                result.forEach(function(item){

                    floorData.push({
                        's_no':s_no,
                        building_name:item.building_name,
                        floor_name:item.floor_name,
                        occupancy_type:'Public Toilets',

                        male_closet:item.water_officemale || 0,
                        female_closet:item.water_officefemale || 0,
                        total_closet:item.water_officemale || 0 + item.water_officefemale || 0,

                        male_ablution:item.ablution_officemale || 0,
                        female_ablution : item.ablution_officefemale || 0,
                        total_ablution:item.ablution_officemale || 0 + item.ablution_officefemale || 0,

                        male_urinals:item.urinals_officemale || 0,
                        female_urinals:item.urinals_officefemale || 0,
                        total_urinals:item.urinals_officemale || 0 + item.urinals_officefemale || 0,

                        male_washbasins:item.wash_officemale || 0,
                        female_washbasins:item.wash_officefemale || 0,
                        total_washbasins:item.wash_officemale || 0 + item.wash_officefemale || 0,

                        male_bath:item.bath_officemale || 0,
                        female_bath:item.bath_officefemale || 0,
                        total_bath:item.bath_officemale || 0 + item.bath_officefemale || 0,

                        male_fountain:0,
                        female_fountain:0,
                        total_fountain:item.drinking_poffice || 0,

                        male_cleaners:0,
                        female_cleaners:0,
                        total_cleaners:item.cleaners_poffice || 0,

                        male_kitchen:0,
                        female_kitchen:0,
                        total_kitchen:0
                        
                    },{
                        's_no':s_no+1,
                        building_name:item.building_name,
                        floor_name:item.floor_name,
                        occupancy_type:'Staff Toilets',
                        
                        male_closet:item.water_offstaffmale || 0,
                        female_closet:item.water_offstafffemale || 0,
                        total_closet:item.water_offstaffmale || 0 + item.water_offstafffemale || 0,

                        male_ablution:item.ablution_offstaffmale || 0,
                        female_ablution : item.ablution_offstafffemale || 0,
                        total_ablution:item.ablution_offstaffmale || 0 + item.ablution_offstafffemale || 0,

                        male_urinals:item.urinals_offstaffmale || 0,
                        female_urinals:item.urinals_offstafffemale || 0,
                        total_urinals:item.urinals_offstaffmale || 0 + item.urinals_offstafffemale || 0,

                        male_washbasins:item.wash_offstaffmale || 0,
                        female_washbasins:item.wash_offstafffemale || 0,
                        total_washbasins:item.wash_offstaffmale || 0 + item.wash_offstafffemale || 0,

                        male_bath:item.bath_offstaffmale || 0,
                        female_bath:item.bath_offstafffemale || 0,
                        total_bath:item.bath_offstaffmale || 0 + item.bath_offstafffemale || 0 ,

                        male_fountain:0,
                        female_fountain:0,
                        total_fountain:item.drinking_stoffice || 0,

                        male_cleaners:0,
                        female_cleaners:0,
                        total_cleaners:item.cleaners_stoffice || 0,

                        male_kitchen:0,
                        female_kitchen:0,
                        total_kitchen:0

                    });

                    s_no=s_no+2;

                    projectData[0].male=projectData[0].male+item.water_officemale || 0 + item.water_offstaffmale || 0;

                    projectData[0].female=projectData[0].female+item.water_officefemale || 0 + item.water_offstafffemale || 0;
                    
                    projectData[0].total=projectData[0].total+item.water_officemale || 0 + item.water_offstaffmale || 0 +item.water_officefemale || 0 + item.water_offstafffemale || 0;
                    
                    projectData[1].male=projectData[1].male+item.ablution_officemale || 0 + item.ablution_offstaffmale || 0;
                    
                    projectData[1].female=projectData[1].female+item.ablution_officefemale || 0 + item.ablution_offstafffemale || 0;
                   
                    projectData[1].total=projectData[1].total+ item.ablution_officemale || 0 + item.ablution_offstaffmale || 0 + item.ablution_officefemale || 0 + item.ablution_offstafffemale || 0;
                    
                    projectData[2].male=projectData[2].male+item.urinals_officemale || 0 + item.urinals_offstaffmale || 0;
                   
                    projectData[2].female=projectData[2].female+item.urinals_officefemale || 0 + item.urinals_offstafffemale || 0;
                    
                    projectData[2].total=projectData[2].total+item.urinals_officemale || 0 + item.urinals_offstaffmale || 0 + item.urinals_officefemale || 0 + item.urinals_offstafffemale || 0;
                    
                    projectData[3].male=projectData[3].male+item.wash_officemale || 0 + item.wash_offstaffmale || 0;
                    
                    projectData[3].female=projectData[3].female+ item.wash_officefemale || 0 + item.wash_offstafffemale || 0;
                   
                    projectData[3].total=projectData[3].total+ item.wash_officemale || 0 + item.wash_offstaffmale || 0 + item.wash_officefemale || 0 + item.wash_offstafffemale || 0; 
                    
                    projectData[4].male=projectData[4].male+item.bath_officemale || 0 + item.bath_offstaffmale || 0;
                    
                    projectData[4].female=projectData[4].female+ item.bath_officefemale || 0 + item.bath_offstafffemale || 0;
                   
                    projectData[4].total=projectData[4].total+ item.bath_officemale || 0 + item.bath_offstaffmale || 0 + item.bath_officefemale || 0 + item.bath_offstafffemale || 0; 
                    
                    projectData[5].male=projectData[5].male+0;
                    projectData[5].female=projectData[5].female+0;
                    projectData[5].total=projectData[5].total+ item.drinking_poffice || 0 + item.drinking_stoffice || 0;

                    projectData[6].male=projectData[6].male+0;
                    projectData[6].female=projectData[6].female+0;
                    projectData[6].total=projectData[6].total+ item.cleaners_stoffice || 0 + item.cleaners_poffice || 0;
                    
                })

                // res.json(projectData);

                res.status(201).json({
                    projectData:projectData,
                    floorreport:floorData
                });
                
            }
        });
    }
                                     
                                                // Residential
   else if (req.params.btype == 'Single bedroom dwelling unit'|| req.params.btype == 'Double bedroom dwelling unit'  || req.params.btype == 'Triple bedroom dwelling unit' || req.params.btype == 'Four bedroom dwelling unit' || req.params.btype == 'Lodging and rooming houses' || req.params.btype == 'Apartment Houses' )
   {
       TFC.Project.aggregate([
           {$match:{"_id":ObjectId(req.params.pid)}},
           { $unwind:'$building_info' },
           {
               $group:
               {
                   _id: {'building_name':'$building_info.building_name','floor_name':'$building_info.floor_name','water_dwIndividual':'$building_info.water_dwIndividual','water_dwoIndividual':'$building_info.water_dwoIndividual','ablution_dwIndividual':'$building_info.ablution_dwIndividual','ablution_dwoIndividual':'$building_info.ablution_dwoIndividual','urinals_dwIndividual':'$building_info.urinals_dwIndividual','urinals_dwoIndividual':'$building_info.urinals_dwoIndividual','wash_dwIndividual':'$building_info.wash_dwIndividual','wash_dwoIndividual':'$building_info.wash_dwoIndividual','bath_dwIndividual':'$building_info.bath_dwIndividual','bath_dwoIndividual':'$building_info.bath_dwoIndividual','kitchen_wodwell':'$building_info.kitchen_wodwell','kitchen_wdwell':'$building_info.kitchen_wdwell'}
               }
           },
           {
               $project:
               {
                   _id:0,

                   building_name:'$_id.building_name',
                   floor_name:'$_id.floor_name',

                   water_dwIndividual:'$_id.water_dwIndividual',
                   water_dwoIndividual:'$_id.water_dwoIndividual',
                   
                   ablution_dwIndividual:'$_id.ablution_dwIndividual',
                   ablution_dwoIndividual:'$_id.ablution_dwoIndividual',

                   urinals_dwIndividual:'$_id.urinals_dwIndividual',
                   urinals_dwoIndividual:'$_id.urinals_dwoIndividual',

                   wash_dwIndividual:'$_id.wash_dwIndividual',
                   wash_dwoIndividual:'$_id.wash_dwoIndividual',

                   bath_dwIndividual:'$_id.bath_dwIndividual',
                   bath_dwoIndividual:'$_id.bath_dwoIndividual',

                   kitchen_wodwell:'$_id.kitchen_wodwell',
                   kitchen_wdwell:'$_id.kitchen_wdwell',

               }
           },
           { 
               $sort : { water_dwIndividual : 1}
           }
         ], function (err, result) {
           if (err) {
               next(err);
           } 
           else 
           {

            var floorData = [];
            var projectData=[
                   {s_no:1,'particulars':'Water Closet','male':0,'female':0,'total':0},
                   {s_no:2,'particulars':'Ablution tab','male':0,'female':0,'total':0},
                   {s_no:3,'particulars':'Urinals','male':0,'female':0,'total':0},
                   {s_no:4,'particulars':'Wash basins','male':0,'female':0,'total':0},
                   {s_no:5,'particulars':'Bath Showers','male':0,'female':0,'total':0},
                   {s_no:6,'particulars':'Kitchen Sink','male':0,'female':0,'total':0},
               ]

               var s_no = 1;
               result.forEach(function(item){

                floorData.push({
                    's_no':s_no,
                    building_name:item.building_name,
                    floor_name:item.floor_name,
                    occupancy_type:'Dwelling With Individual Convenience',

                    male_closet:0,
                    female_closet:0,
                    total_closet:item.water_dwIndividual || 0 ,

                    male_ablution:0,
                    female_ablution : 0,
                    total_ablution:item.ablution_dwIndividual || 0,

                    male_urinals:0,
                    female_urinals:0,
                    total_urinals:item.urinals_dwIndividual || 0,

                    male_washbasins:0,
                    female_washbasins:0,
                    total_washbasins:item.wash_dwIndividual || 0,

                    male_bath:0,
                    female_bath:0,
                    total_bath:item.bath_dwIndividual || 0,

                    male_fountain:0,
                    female_fountain:0,
                    total_fountain:0,

                    male_cleaners:0,
                    female_cleaners:0,
                    total_cleaners:0,

                    male_kitchen:0,
                    female_kitchen:0,
                    total_kitchen:item.kitchen_wdwell || 0
                    
                },{
                    's_no':s_no+1,
                    building_name:item.building_name,
                    floor_name:item.floor_name,
                    occupancy_type:'Dwelling Without Individual Convenience',
                    
                    male_closet:0,
                    female_closet:0,
                    total_closet:item.water_dwoIndividual || 0,

                    male_ablution:0,
                    female_ablution : 0,
                    total_ablution:item.ablution_dwoIndividual || 0, 

                    male_urinals:0,
                    female_urinals:0,
                    total_urinals:item.urinals_dwoIndividual || 0,

                    male_washbasins:0,
                    female_washbasins:0,
                    total_washbasins:item.wash_dwoIndividual || 0,

                    male_bath:0,
                    female_bath:0,
                    total_bath:item.bath_dwoIndividual || 0 ,

                    male_fountain:0,
                    female_fountain:0,
                    total_fountain:0,

                    male_cleaners:0,
                    female_cleaners:0,
                    total_cleaners:0,

                    male_kitchen:0,
                    female_kitchen:0,
                    total_kitchen:item.kitchen_wodwell || 0

                });

                s_no=s_no+2;

                   projectData[0].male=projectData[0].male+0;
                   
                   projectData[0].female=projectData[0].female+0;
                   
                   projectData[0].total=projectData[0].total+item.water_dwIndividual || 0 + item.water_dwoIndividual || 0 ;
                   
                   projectData[1].male=projectData[1].male+0;
                   
                   projectData[1].female=projectData[1].female+0;
                   
                   projectData[1].total=projectData[1].total+item.ablution_dwIndividual || 0 + item.ablution_dwoIndividual || 0 ;
                   
                   projectData[2].male=projectData[2].male+0;
                   
                   projectData[2].female=projectData[2].female+0;

                   projectData[2].total=projectData[2].total+item.urinals_dwIndividual || 0 + item.urinals_dwoIndividual || 0 ;

                   projectData[3].male=projectData[3].male+0;
                   
                   projectData[3].female=projectData[3].female+0;
                   
                   projectData[3].total=projectData[3].total+item.wash_dwIndividual || 0 + item.wash_dwoIndividual || 0 ;

                   projectData[4].male=projectData[4].male+0;
                   
                   projectData[4].female=projectData[4].female+0;
                   
                   projectData[4].total=projectData[4].total+item.bath_dwIndividual || 0 + item.bath_dwoIndividual || 0 ;

                   projectData[5].male=projectData[5].male+0;
                   
                   projectData[5].female=projectData[5].female+0;
                  
                   projectData[5].total=projectData[5].total+item.kitchen_wodwell || 0 + item.kitchen_wdwell || 0 ;
                  
                })
            //    res.json(projectData);

            res.status(201).json({
                projectData:projectData,
                floorreport:floorData
            });
           }
       });
   }
    
});

router.get('/thogupu/starRating/:starrating', (req, res) => {
  
    var input = JSON.parse(req.params.starrating);
    const details = new Thogupu.Rating
    ({ 
        ques1_rate:input.ques1_rate,
        ques2_rate:input.ques2_rate,
        ques3_rate:input.ques3_rate,
        ques4_rate:input.ques4_rate,
        ques5_rate:input.ques5_rate,
        feedback_desc:input.feedback_desc
    });
    console.log(details)
    

    details.save(function(err, result) { 
        if (err) {
            return res.status(500).json({
                title: 'An error occurred',
                error: err
            });
        }
        else
        {
            res.send(result);
            console.log(result)
        }
    })
});

router.get('/api/helpmessage/:helpData', function (req, res, next){

    var input=JSON.parse(req.params.helpData);
    
    
    const small = new Thogupu.Thogupuhelp({ 
        user_email:input.user_email,
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
                to:input.user_email, // list of receivers
                //to: req.body.email,
                subject: 'Thogupu Help', // Subject line
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

router.post("/feedbackprofile/:umail",function(req, res) {
    console.log()
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



module.exports = router;