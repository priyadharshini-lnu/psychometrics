function AssignsForm () {
  this.init = function() {
    this.startListening()
    $(document).on('change', '#assigns_form #resource_assessment_id', this.onResourceAssessmentChange)
    $(document).on('change', '#assigns_form #resource_report_ids', this.onResourceReportChange)
    $(document).on('change', '#assigns_form #resource_user_access', this.onResourceUserAccessChange)
  }

  this.startListening = function() {
    var self = this
    $(document).on('ajax:complete', function(_, data) {
      if($('#assigns_form').size() > 0) {
        self.fireResourceAssessment()
        self.fireResourceUserAccess()
      }
    });
  }

  this.fireResourceAssessment = function() {
    $('#assigns_form #resource_assessment_id').change()
  }

  this.fireResourceUserAccess = function() {
    $('#assigns_form #resource_user_access').change()
  }

  this.onResourceAssessmentChange = function(event) {
    $('#assigns_form .resource_user_access').addClass('hidden').find(':checkbox').addClass('disabled')
    $('#assigns_form .resource_preserve_user_access').addClass('hidden')
  }

  this.onResourceReportChange = function(event) {
    var selectedAssessment = $('#assigns_form #resource_assessment_id option:selected')
    var $selectedReports = $('#assigns_form #resource_report_ids option:selected:not([disabled])');
    var reportIsSelected = $('#assigns_form #resource_report_ids option:selected').length
    var $multipleMessage = $('[data-behavior~=multiple-report-message]');
    if ($selectedReports.data('multiple')) {
      $multipleMessage.show();
    } else {
      $multipleMessage.hide();
    }

    var assessmentIsPsychometric = selectedAssessment.data('psychometric')
    if(reportIsSelected) {
      $('#assigns_form .resource_user_access').find(':checkbox').prop('checked', true)
      $('#assigns_form .resource_user_access').removeClass('hidden').find(':checkbox').prop('disabled', false).removeClass('disabled')
    } else {
      $('#assigns_form .resource_user_access').addClass('hidden').find(':checkbox').addClass('disabled')
    }

    var reportIsPreselected = $('#resource_report_ids option:selected:disabled').length
    if(reportIsPreselected) {
      $('#assigns_form .resource_preserve_user_access').removeClass('hidden')
    } else {
      $('#assigns_form .resource_preserve_user_access').addClass('hidden')
    }
  }

  this.onResourceUserAccessChange = function(event) {
    $('#assigns_form .resource_user_access :hidden').val(this.checked)
  }
}

$(function () {
  var AssignsFormObj = new AssignsForm()
  AssignsFormObj.init();
});
