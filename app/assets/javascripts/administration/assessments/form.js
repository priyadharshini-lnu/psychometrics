function AssessmentsForm () {
  var integrations = ['mindmill', 'hogan', 'saville', 'pearson', 'iiht']
  this.init = function() {
    this.startListening()
    $(document).on('change', '#assessments_form #resource_type', this.showHideSections);
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
    $('#assessments_form #pearson_assessment_id').change()
  }

  this.showHideSections = function(event) {
    var value = $('#assessments_form #resource_type').val()
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
    var integrationsTypeArray = integrationType.toLowerCase().split('::')
    var className = integrationsTypeArray[1]

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
