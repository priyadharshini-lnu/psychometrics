function ReportsForm () {
  this.init = function() {
    this.startListening()
    $(document).on('change', '#reports_form #resource_assessment_ids', this.onResourceAssessmentChange);
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
    $('#reports_form #resource_assessment_ids').change();
  }

  this.onResourceAssessmentChange = function(event) {
    var toggleVisibility = function(options, name) {

      var allSameType = options.size() > 0
      options.each(function(index) {
        allSameType = allSameType & $(this).data(name);
      });

      if(allSameType) {
        $('#reports_form .resource_' + name).removeClass('hidden').find(":input").removeAttr('disabled').removeClass('disabled')
      } else {
        $('#reports_form .resource_' + name).addClass('hidden').find(":input").attr('disabled')
      }
    }

    var options = $('option:selected', this);
    toggleVisibility(options, 'mindmill');
    toggleVisibility(options, 'hogan');
  }
}

$(function () {
  if($('#administration #reports_index').size() > 0) {
    var ReportsFormObj = new ReportsForm()
    ReportsFormObj.init();
  }
});
