var PROPOSAL = require('../models/proposal_schema'); 
var express = require('express');
var router = express.Router();
var ObjectId=require('mongodb').ObjectID;

var bcrypt = require('bcrypt');
var salt = bcrypt.genSaltSync(10);



router.get('/proposal/getdatainfo', function (req, res, next) {
    PROPOSAL.Login.find({}, function (err, result) {
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

router.get('/proposal/loginuser/:user_name/:pword', function (req, res, next) {
    PROPOSAL.Login.findOne({user_name:req.params.user_name}, function(err, data){
        if(data==null)
        {
            res.status(201).json({
                msg: 'Email id not found'
            });
        }
        else
        {
            bcrypt.compare(req.params.pword, data.pass_word, function(err, doesMatch){
                if(doesMatch)
                {
                    res.status(201).json({
                        msg: 'Success'
                    }); 
                }
                else
                {
                    res.status(201).json({
                        msg: 'Wrong Password'
                    });
                }
           }); 
        }
    });
});

router.get('/proposal/resetpassword/:emailid', function (req, res, next) {
    PROPOSAL.Login.find({'user_name':req.params.user_name},function(err, result){ 
        if (err) {
            return res.status(500).json({
                title: 'An error occurred',
                error: err
            });
        }
        else
        {
            if(result.length>0)
            {
                var randomstring = Math.random().toString(36).slice(-8);
                var passwordToSave = bcrypt.hashSync(randomstring, salt);
                PROPOSAL.Login.findById(ObjectId(result[0]._id),function(err, data){ 
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
                            let transporter = nodemailer.createTransport({
                                host: 'smtp.gmail.com',
                                port: 465,
                                secure: true, // secure:true for port 465, secure:false for port 587
                                auth: {
                                    type:'OAuth2',
                                    user: 'contact@jupiterbrothers.com',
                                    serviceClient:key.client_id,
                                    privateKey:key.private_key
                                }
                            });

                            let mailOptions = {
                                from: '"Jupiter Brothers" <contact@jupiterbrothers.com>', 
                                to: req.params.emailid, 
                                subject: '', // Subject line
                                text: 'Authentication', // plain text body
                               
                            };
                            transporter.sendMail(mailOptions, (error, info) => {
                                if (error) {
                                    return console.log(error);
                                }
                                res.json('reset');
                            });
                        }
                    });
                });
            }
            else
            {
                res.json('not exist');
            }
        }
    });
});



router.post('/proposal/saveprojectinfo/:pid',function(req,res,next)  {
    console.log(req.body)
    var bulk = PROPOSAL.Project.collection.initializeUnorderedBulkOp();
    bulk.find( { '_id': ObjectId(req.params.pid)} ).update( { $set: req.body } );
    bulk.execute();  
    res.json('saved');
});


router.get('/proposal/getinfovalue/:pid',  function (req, res, next) {
    PROPOSAL.Project.findById(ObjectId(req.params.pid),function(err, data){

        // var date3 = new Date(); 
        // var date4 = new Date(data.expired_date); 
        // var Diff_Time = date4.getTime() - date3.getTime(); 
        // var Diff_Days = Diff_Time / (1000 * 3600 * 24); 
        // var totaldays=Math.round(Diff_Days);

        res.status(201).json({
            client_name:data.client_name,

            LIM_info:data.LIM_info,
            Deposit_plan:data.Deposit_plan,
            legal_info:data.legal_info,
            complete_sign:data.complete_sign,
            Asst_client:data.Asst_client,
            time_budjetinfo:data.time_budjetinfo,
            health_safety:data.health_safety,
            site_info:data.site_info,
            depplan_info:data.depplan_info,
            ease_covinfo:data.ease_covinfo,
            topogl_survey:data.topogl_survey,
            geoTechnical_info:data.geoTechnical_info,
            build_info:data.build_info,
            buildservice_info:data.buildservice_info,
            district_plan:data.district_plan,
            heritage_report:data.heritage_report,
            traffic_report:data.traffic_report,
            health_info:data.health_info,
            arborist_report:data.arborist_report,
            other_info:data.other_info,
            Teritorial_info:data.Teritorial_info,
            ESD_object:data.ESD_object,
            answerInfo:data.answerInfo,
            Bim_object:data.Bim_object,
            programme_info:data.programme_info,
            cost_advice:data.cost_advice,
            feasibility_info:data.feasibility_info,
            other_consultants:data.other_consultants,
            piInsurance_info:data.piInsurance_info,
            addService_info:data.addService_info,
            architect_agreement:data.architect_agreement,
            site_confirmed:data.site_confirmed,
            Brief_provide:data.Brief_provide,
            safety_info:data.safety_info,
            allrelavant_info:data.allrelavant_info,
            confirm_objective:data.confirm_objective,
            project_programme:data.project_programme,
            cost_budjetinfo:data.cost_budjetinfo,
             pi_insuranceinfo:data.pi_insuranceinfo,
            sign_offinfo:data.sign_offinfo,
    
            // stage b2
            approval_change:data.approval_change,
            deliverable_prvs:data.deliverable_prvs,
            review_client:data.review_client,
            HSIDReport_struct:data.HSIDReport_struct,
            visit_siteinfo:data.visit_siteinfo,
            update_programmeinfo:data.update_programmeinfo,
            design_meeting:data.design_meeting,
            review_options:data.review_options,
            Bim_execution:data.Bim_execution,
            prpare_drawings:data.prpare_drawings,
            territorial_authority:data.territorial_authority,
            development_rules:data.development_rules,
            design_buildinginfo:data.design_buildinginfo,
            consultants_info:data.consultants_info,
            assit_client:data.assit_client,
            architect_design:data.architect_design,
            forward_client:data.forward_client,
            Qty_surveyor:data.Qty_surveyor,
            design_constraintsinfo:data.design_constraintsinfo,
            additional_info:data.additional_info,
            update_info:data.update_info,
            report_structinfo:data.report_structinfo,
            ESD_apporachinfo:data.ESD_apporachinfo,
            execute_planinfo:data.execute_planinfo,
            progamchange_info:data.progamchange_info,
            approved_info:data.approved_info,
            design_drawinginfo:data.design_drawinginfo,
            roughOrder_info:data.roughOrder_info,
            provide_report:data.provide_report,
            signoff_deliverable:data.signoff_deliverable,
    
            // stage b3
    
            proceed_stageinfo:data.proceed_stageinfo,
            previous_stage:data.previous_stage,
            uptodate_info:data.uptodate_info,
            HSIDInput_info:data.HSIDInput_info,
            update_overallinfo:data.update_overallinfo,
            degign_coordinate:data.degign_coordinate,
            ESD_consideOption:data.ESD_consideOption,
            finaliseBIM_info:data.finaliseBIM_info,
            approve_concept:data.approve_concept,
            outline_specification:data.outline_specification,
            architect_doc:data.architect_doc,
            regarding_buildinfo:data.regarding_buildinfo,
            development_rulesifo:data.development_rulesifo,
            resource_consentinfo:data.resource_consentinfo,
            urban_designinfo:data.urban_designinfo,
            urban_documentation:data.urban_documentation,
            building_clientinfo:data.building_clientinfo,
            design_inputinfo:data.design_inputinfo,
            architectural_info:data.architectural_info,
            coordinate_archinfo:data.coordinate_archinfo,
            Quantity_costinfo:data.Quantity_costinfo,
            material_schduleinfo:data.material_schduleinfo,
            service_info:data.service_info,
            brief_change:data.brief_change,
            assesment_register:data.assesment_register,
            Esdinput_report:data.Esdinput_report,
            BIMexecute_plan:data.BIMexecute_plan,
            inputProgramme_info:data.inputProgramme_info,
            preliminary_design:data.preliminary_design,
            outline_inputinfo:data.outline_inputinfo,
            resource_consent:data.resource_consent,
            estimate_costinfo:data.estimate_costinfo,
            designReport_info:data.designReport_info,
            Sign_off:data.Sign_off,
                        // stage B4
            approval_proceed:data.approval_proceed,
            preStage_info:data.preStage_info,
            brief_info:data.brief_info,
            healthy_safetyinfo:data.healthy_safetyinfo,
            update_overall:data.update_overall,
            review_checksinfo:data.review_checksinfo,
            meeting_info:data.meeting_info,
            ESD_incorporate:data.ESD_incorporate,
            BIM_finalise:data.BIM_finalise,
            surveyor_estimate:data.surveyor_estimate,
            forward_quantity:data.forward_quantity,
            elevation_sectionInfo:data.elevation_sectionInfo,
            specific_issuesinfo:data.specific_issuesinfo,
            development_planinfo:data.development_planinfo,
            lodgeApplication_info:data.lodgeApplication_info,
            urban_designplan:data.urban_designplan,
            prepare_document:data.prepare_document,
            building_codeinfo:data.building_codeinfo,
            consultants_input:data.consultants_input,
            against_architecture:data.against_architecture,
            coordinate_architect:data.coordinate_architect,
            quantity_estimateinfo:data.quantity_estimateinfo,
            review_variousOption:data.review_variousOption,
            developed_Report:data.developed_Report,
            Add_Servicesinfo:data.Add_Servicesinfo,
            Brief_updateinfo:data.Brief_updateinfo,
            Assesment_registerinfo:data.Assesment_registerinfo,
            updated_reportinfo:data.updated_reportinfo,
            BimExecute_update:data.BimExecute_update,
            programme_confirm:data.programme_confirm,
            preliminary_drawingInfo:data.preliminary_drawingInfo,
            outline_providedInfo:data.outline_providedInfo,
            Resource_app:data.Resource_app,
            estimate_costQS:data.estimate_costQS,
            developed_provided:data.developed_provided,
            deliverable_signoff:data.deliverable_signoff,
    
            // StageB5
    
            proceed_stage:data.proceed_stage,
            previousstage_input:data.previousstage_input,
            Brief_requirementinfo:data.Brief_requirementinfo,
            HSID_report:data.HSID_report,
            Update_workProgramme:data.Update_workProgramme,
            ArchitectQAinfo:data.ArchitectQAinfo,
            chair_meetingInfo:data.chair_meetingInfo,
            design_documentation:data.design_documentation,
            Monitor_outputinfo:data.Monitor_outputinfo,
            developdesign_info:data.developdesign_info,
            client_consultants:data.client_consultants,
            tradeSection_info:data.tradeSection_info,
            finish_materialinfo:data.finish_materialinfo,
            building_authorityinfo:data.building_authorityinfo,
            check_designinfo:data.check_designinfo,
            Nz_standardsinfo:data.Nz_standardsinfo,
            lodge_Applicationinfo:data.lodge_Applicationinfo,
            design_input:data.design_input,
            againarchitect_info:data.againarchitect_info,
            document_consultinfo:data.document_consultinfo,
            pre_tenderinfo:data.pre_tenderinfo,
            methodology_client:data.methodology_client,
            add_serviceinfo:data.add_serviceinfo,
            assesmt_finaliseinfo:data.assesmt_finaliseinfo,
            report_update:data.report_update,
            Execution_BIM:data.Execution_BIM,
            confirmed_program:data.confirmed_program,
            drawing_document:data.drawing_document,
            schedules_info:data.schedules_info,
            completd_specific:data.completd_specific,
            involving_constructor:data.involving_constructor,
            app_lodged:data.app_lodged,
            pre_tenderQS:data.pre_tenderQS,
            method_procurument:data.method_procurument,
            contract_condInfo:data.contract_condInfo,
            signoff_info:data.signoff_info,
    
            // stage B6
            contract_deliverable:data.contract_deliverable,
            contract_approval:data.contract_approval,
            contract_construction:data.contract_construction,
            client_agreement:data.client_agreement,
            contract_documents:data.contract_documents,
            bond_insuranceinfo:data.bond_insuranceinfo,
            monitory_contractinfo:data.monitory_contractinfo,
            Legal_adviceinfo:data.Legal_adviceinfo,
            tenderer_selection:data.tenderer_selection,
            tender_document:data.tender_document,
            tender_summaryinfo:data.tender_summaryinfo,
            compile_Drawinginfo:data.compile_Drawinginfo,
            BIM_contractor:data.BIM_contractor,
            nominated_client:data.nominated_client,
            tenders_client:data.tenders_client,
            selected_tenders:data.selected_tenders,
            tender_monitor:data.tender_monitor,
            receive_tenders:data.receive_tenders,
            client_provideinfo:data.client_provideinfo,
            contract_appoinment:data.contract_appoinment,
            unsuccessful_info:data.unsuccessful_info,
            contract_worksinfo:data.contract_worksinfo,
            cash_flowinfo:data.cash_flowinfo,
            arrange_signinfo:data.arrange_signinfo,
            update_construction:data.update_construction,
            service_addinfo:data.service_addinfo,
            doc_prepareinfo:data.doc_prepareinfo,
            optain_tender:data.optain_tender,
            report_tenderinfo:data.report_tenderinfo,
            confirmed_programinfo:data.confirmed_programinfo,
            proj_cashflow:data.proj_cashflow,
            complete_agreement:data.complete_agreement,
            construction_prepared:data.construction_prepared,
            onsign_offinfo:data.onsign_offinfo,
          
            // stage B7
          
            administrator_deliverable:data.administrator_deliverable,
            contract_construct:data.contract_construct,
            contract_approvalinfo:data.contract_approvalinfo,
            construct_docinfo:data.construct_docinfo,
            formal_construction:data.formal_construction,
            constructor_insurance:data.constructor_insurance,
            contractor_bond:data.contractor_bond,
            safety_healthy:data.safety_healthy,
            contractor_input:data.contractor_input,
            construction_planinfo:data.construction_planinfo,
            administration_info:data.administration_info,
            client_representative:data.client_representative,
            communicate_monitor:data.communicate_monitor,
            site_meetingsinfo:data.site_meetingsinfo,
            variation_receiveinfo:data.variation_receiveinfo,
            instruction_contract:data.instruction_contract,
            consultants_coordinate:data.consultants_coordinate,
            peer_producer:data.peer_producer,
            separate_contractor:data.separate_contractor,
            contract_works:data.contract_works,
            samples_certify:data.samples_certify,
            materiarl_acceptance:data.materiarl_acceptance,
            offSite_certify:data.offSite_certify,
            supplementary_records:data.supplementary_records,
            shop_drawings:data.shop_drawings,
            contract_element:data.contract_element,
            progressively_update:data.progressively_update,
            paymentsInfo:data.paymentsInfo,
            costs_monitor:data.costs_monitor,
            Monitory_required:data.Monitory_required,
            Variation_certify:data.Variation_certify,
            contractors_payment:data.contractors_payment,
            final_account:data.final_account,
            Time_info:data.Time_info,
            contractors_agree:data.contractors_agree,
            contractor_progress:data.contractor_progress,
            assess_approve:data.assess_approve,
            Legislation_monitor:data.Legislation_monitor,
            Resource_consent:data.Resource_consent,
            building_amendments:data.building_amendments,
            public_certificate:data.public_certificate,
            code_certificate:data.code_certificate,
            completion_info:data.completion_info,
            transfer_insurance:data.transfer_insurance,
            defects_notice:data.defects_notice,
            practical_notice:data.practical_notice,
            Liability_certificate:data.Liability_certificate,
            guarantees_certify:data.guarantees_certify,
            built_documents:data.built_documents,
            addtl_serviceinfo:data.addtl_serviceinfo,
            contract_meeting:data.contract_meeting,
            contract_instruction:data.contract_instruction,
            payment_schduleinfo:data.payment_schduleinfo,
            sectional_certificateIssue:data.sectional_certificateIssue,
            liabilty_compliance:data.liabilty_compliance,
            warranties_manual:data.warranties_manual,
            compilance_CPU:data.compilance_CPU,
            final_accountinfo:data.final_accountinfo,
          
            // Stage B8
          
            previous_observation:data.previous_observation,
            document_info:data.document_info,
            client_approval:data.client_approval,
            construction_document:data.construction_document,
            construct_admininfo:data.construct_admininfo,
            health_observation:data.health_observation,
            HSID_observationinfo:data.HSID_observationinfo,
            HSW_observation:data.HSW_observation,
            observation_info:data.observation_info,
            communicate_issue:data.communicate_issue,
            meeting_siteinfo:data.meeting_siteinfo,
            contrac_administrator:data.contrac_administrator,
            contract_worksObsv:data.contract_worksObsv,
            undertake_comments:data.undertake_comments,
            meaterial_documents:data.meaterial_documents,
            goodOff_siteInfo:data.goodOff_siteInfo,
            supplementary_formal:data.supplementary_formal,
            design_reviewinfo:data.design_reviewinfo,
            shop_drawingsInfo:data.shop_drawingsInfo,
            asBuilt_contract:data.asBuilt_contract,
            payments_info:data.payments_info,
            contract_administrator:data.contract_administrator,
            contractor_claims:data.contractor_claims,
            FilAccount_admin:data.FilAccount_admin,
            time_Schdule:data.time_Schdule,
            contract_feedback:data.contract_feedback,
            progress_administrator:data.progress_administrator,
            Time_Reviewinfo:data.Time_Reviewinfo,
            complaince_input:data.complaince_input,
            consent_monitorinfo:data.consent_monitorinfo,
            prepare_necessaryinfo:data.prepare_necessaryinfo,
            completionInfo:data.completionInfo,
            contract_documentsInfo:data.contract_documentsInfo,
            section_completion:data.section_completion,
            practical_completion:data.practical_completion,
            corrected_defects:data.corrected_defects,
            warranties_contract:data.warranties_contract,
            manuals_document:data.manuals_document,
            addService_observationInfo:data.addService_observationInfo,
            atend_meetingInfo:data.atend_meetingInfo,
            contract_deriction:data.contract_deriction,
            samples_offsite:data.samples_offsite,
            supplement_docm:data.supplement_docm,
            design_shopDrawing:data.design_shopDrawing,
            practical_works:data.practical_works,
            liability_defects:data.liability_defects,
            guarantees_docm:data.guarantees_docm,
          
            building_client:data.building_client,
    

           
        });
        console.log(data.client_name)
    });
});

module.exports = router;