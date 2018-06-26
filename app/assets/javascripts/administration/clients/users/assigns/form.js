function AssignsForm () {
  this.init = function() {
    this.startListening()
    $(document).on('change', '#assigns_form #resource_assessment_id', this.onResourceAssessmentChange);
  }

  this.startListening = function() {
    var self = this
    $(document).on('ajax:complete', function(_, data){
      if($('#assigns_form').size() > 0) {
        self.fireResourceAssessment()
      }
    });
  }

  this.fireResourceAssessment = function() {
    $('#assigns_form #resource_assessment_id').change();
  }

  this.onResourceAssessmentChange = function(event) {
    var option = $('option:selected', this)
    if(option.data('psychometric')) {
      $('#assigns_form .resource_user_access').removeClass('hidden').find(':input').removeAttr('disabled').removeClass('disabled')
    } else if(option[0].value) {
      $('#assigns_form .resource_user_access').removeClass('hidden').find(':input').attr('disabled', true).addClass('disabled')
    } else {
      $('#assigns_form .resource_user_access').addClass('hidden').find(':input').attr('disabled', true).addClass('disabled')
    }
  }
}

$(function () {
  var AssignsFormObj = new AssignsForm()
  AssignsFormObj.init();
});
