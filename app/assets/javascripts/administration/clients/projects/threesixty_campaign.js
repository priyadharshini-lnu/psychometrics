// $(function () {
//   function changeType() {
//     console.log("dad")
//     var type = $(this).find('option:selected').attr('value')
//     $('#assessment_field, #factors_field, #campaign_template_fields').css('display', 'none')
//     $('#assessment_field select, #campaign_template_fields select').attr('disabled', 'disabled')

//     if (type == 'previous_360') {
//       fetchAssessments(type)
//       $('#assessment_field').css('display', 'block')
//       $('#assessment_field select').removeAttr('disabled')
//     } else if (type == 'standard_360') {
//       $('#campaign_template_fields select').removeAttr('disabled')
//       $('#campaign_template_fields').css('display', 'block')
//       fetchCampaignTemplates(type)
//     }
//   }

//   $(document).on('change', '#threesixty_campaign #resource_type', changeType)
//   changeType.call($('#threesixty_campaign #resource_type'))

//   $(document).on('change', '#threesixty_campaign #campaign_template_id', function () {
//     var campaignTemplateId = $(this).find('option:selected').attr('value')
//     var assessmentId = campaignTemplateAndAssessmentIds[campaignTemplateId]

//     fetchFactors(assessmentId)
//   })

//   function assessmentHandler() {
//     $('#threesixty_campaign #resource_threesixty_campaign_assessment_id').change(function () {
//       var assessment = $(this).find('option:selected').attr('value')
//       fetchFactors(assessment)
//     })
//   }

//   function fetchAssessments(type) {
//     var url = $('#threesixty_campaign').attr('action') + '/assessments?type=' + type

//     $.ajax({
//       url: url,
//       type: 'GET',
//       dataType: 'script',
//       success: function () {
//         assessmentHandler()
//       }
//     });
//   }

//   function fetchCampaignTemplates(type) {
//     var url = $('#threesixty_campaign').attr('action') + '/campaign_templates'

//     $.getScript(url)
//   }

//   function fetchFactors(assessment) {
//     var url = $('#threesixty_campaign').attr('action') + '/factors?assessment_id=' + assessment

//     $.ajax({
//       url: url,
//       type: 'GET',
//       dataType: 'script',
//       success: function () {
//         $('#factors_field').css('display', 'block')
//       }
//     });
//   }

//   assessmentHandler()
// })
