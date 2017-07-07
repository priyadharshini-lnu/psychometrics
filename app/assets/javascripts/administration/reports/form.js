function ReportsForm () {
  this.init = function() {
    this.startListening()
    $(document).on('change', '#reports_form #resource_assessment_id', this.onResourceAssessmentChange);
  }

  this.startListening = function() {
    var self = this
    $(document).on('ajax:complete', function(_, data){
      if($('#reports_form').size() > 0) {
        self.fireResourceAssessment()
      }
    });
  }

  this.fireResourceAssessment = function() {
    $('#reports_form #resource_assessment_id').change();
  }

  this.onResourceAssessmentChange = function(event) {
    var option = $('option:selected', this)
    if(option.data('mindmill')) {
      $('#reports_form .resource_mindmill').removeClass('hidden').find(":input").removeAttr('disabled')
    } else {
      $('#reports_form .resource_mindmill').addClass('hidden').find(":input").attr('disabled')
    }
  }
}

$(function () {
  if($('#administration #reports_index').size() > 0) {
    var ReportsFormObj = new ReportsForm()
    ReportsFormObj.init();
  }
});
