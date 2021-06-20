function AssessmentsForm () {
  var integrations = ['mindmill', 'hogan', 'saville']
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
    if (value == "Assessments::Common") {
      $('#assessments_form').find('.common').removeClass('hidden').find(":input").removeAttr('disabled', true)
      integrations.forEach(function(integrationName) {
        $('#assessments_form').find('.' + integrationName + ':not(.common)').addClass('hidden').find(":input").attr('disabled', true)
      })
      return
    }

    this.showHideFieldsForExternalIntegrations(value)
  }.bind(this)

  this.showHideFieldsForExternalIntegrations = function (integrationType) {
    var [_, className] = integrationType.toLowerCase().split('::')

    $('#assessments_form').find('.common:not(.' + className + ')').addClass('hidden').find(":input").attr('disabled', true)
    integrations.forEach(function (integrationName) {
      $('#assessments_form').find('.' + integrationName + ':not(.' + className + ')').addClass('hidden').find(":input").attr('disabled', true)
    })
    $('#assessments_form').find('.' + className + ':not(.common)').removeClass('hidden').find(":input").removeAttr('disabled')
  }
}

$(function () {
  if($('#administration #assessments_index').size() > 0) {
    var AssessmentsFormObj = new AssessmentsForm()
    AssessmentsFormObj.init();
  }
});
