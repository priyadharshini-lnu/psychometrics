function ReportsForm () {
  var providerReportDisabled = {
    pearson: false
  }
  this.init = function() {
    this.startListening()
    $(document).on('change', '#reports_form #resource_assessment_ids', this.onResourceAssessmentChange);
    $(document).on('change', '#reports_form .external_reports_setting', this.onResourceProviderChange);
    $(document).on('change', '#report_data_only_checkbox', function() {
      var checked = $(this).is(':checked')
      $(".resource_assessments").prop("disabled", checked);
      if (checked) {
        $(".resource_assessments").addClass('hidden');
      } else {
        $(".resource_assessments").removeClass('hidden');
      }
    })
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

      if(allSameType && !_.isEmpty(options)) {
        $resource.removeClass('hidden').find(":input").removeAttr('disabled').removeClass('disabled')
        providerReportDisabled[name] = false
      } else {
        $resource.addClass('hidden').find(":input").attr('disabled', 'disabled')
        providerReportDisabled[name] = true
      }
    }

    var options = $('option:selected', this);

    toggleVisibility(options, 'pearson');
    toggleVisibility(options, 'hogan');
    toggleVisibility(options, 'saville');
  }

  this.onResourceProviderChange = function() {
    var toggleProvider = function() {
      var reportType;
      if ($(`#hogan_report_id`).find('select').val().length > 0) {
        reportType = 'hogan'
      } else if (($(`#saville_report_id`).find('select').val().length > 0)) {
        reportType = 'saville'
      } else {
        reportType = 'internal'
      }

      $('#reports_form #provider_input').removeAttr('disabled')
      $('#reports_form #provider_input').val(reportType)
    }

    toggleProvider()
  }
}

$(function () {
  if($('#administration #reports_index').size() > 0) {
    var ReportsFormObj = new ReportsForm()
    ReportsFormObj.init();
  }
});
