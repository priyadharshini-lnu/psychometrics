function AssessmentsForm () {
  this.init = function() {
    this.startListening()
    $(document).on('change', '#assessments_form #resource_type', this.onResourceTypeChange);
  }

  this.startListening = function() {
    var self = this
    $(document).on('ajax:complete', function(_, data){
      if($('#assessments_form').size() > 0) {
        self.fireResourceType()
      }
    });
  }

  this.fireResourceType = function() {
    $('#assessments_form #resource_type').change();
  }

  this.onResourceTypeChange = function(event) {
    var value = arguments[0].target.value
    switch (value) {
      case 'Assessments::Mindmill':
        $('#assessments_form').find('.common:not(.mindmill)').addClass('hidden').find(":input").attr('disabled', true)
        $('#assessments_form').find('.hogan:not(.mindmill)').addClass('hidden').find(":input").attr('disabled', true)
        $('#assessments_form').find('.mindmill:not(.common)').removeClass('hidden').find(":input").removeAttr('disabled')
        break;
      case 'Assessments::Hogan':
        $('#assessments_form').find('.common:not(.hogan)').addClass('hidden').find(":input").attr('disabled', true)
        $('#assessments_form').find('.mindmill:not(.hogan)').addClass('hidden').find(":input").attr('disabled', true)
        $('#assessments_form').find('.hogan:not(.common)').removeClass('hidden').find(":input").removeAttr('disabled')
        break;
      default:
        $('#assessments_form').find('.common').removeClass('hidden').find(":input").removeAttr('disabled', true)
        $('#assessments_form').find('.mindmill:not(.common)').addClass('hidden').find(":input").attr('disabled', true)
        $('#assessments_form').find('.hogan:not(.common)').addClass('hidden').find(":input").attr('disabled', true)
    }
  }
}

$(function () {
  if($('#administration #assessments_index').size() > 0) {
    var AssessmentsFormObj = new AssessmentsForm()
    AssessmentsFormObj.init();
  }
});
