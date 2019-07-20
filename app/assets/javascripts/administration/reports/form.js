function ReportsForm () {
  var providerReportDisabled = {
    mindmill: false,
    hogan: false
  }
  this.init = function() {
    this.startListening()
    $(document).on('change', '#reports_form #resource_assessment_ids', this.onResourceAssessmentChange);
    $(document).on('change', '#reports_form #resource_hogan_report_setting_attributes_hogan_report_id', this.onResourceHoganReportSettingChange);
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
      var allSameType = _.every(options, function(option) {
        return $(option).data(name)
      });

      $resource = $('#reports_form .resource_' + name)
      $destroy = $('#reports_form .resource_'+name+'.destroy')

      if(allSameType && !_.isEmpty(options)) {
        $resource.removeClass('hidden').find(":input").removeAttr('disabled').removeClass('disabled')
        $destroy.find(":input").attr('disabled', 'disabled')
        providerReportDisabled[name] = false
      } else {
        $resource.addClass('hidden').find(":input").attr('disabled', 'disabled')
        $destroy.find(":input").removeAttr('disabled')
        providerReportDisabled[name] = true
      }
    }

    var options = $('option:selected', this);

    toggleVisibility(options, 'mindmill');
    toggleVisibility(options, 'hogan');
  }

  this.onResourceHoganReportSettingChange = function(event) {
    $destroy = $('#reports_form .resource_hogan.destroy')
    if(event.target.selectedIndex === 0 || providerReportDisabled['hogan']) {
      $destroy.find(":input").removeAttr('disabled')
    } else {
      $destroy.find(":input").attr('disabled', 'disabled')
    }
  }
}

$(function () {
  if($('#administration #reports_index').size() > 0) {
    var ReportsFormObj = new ReportsForm()
    ReportsFormObj.init();
  }
});
