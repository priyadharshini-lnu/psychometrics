function ReportFamiliesForm() {
  this.init = function () {
    this.startListening()
    $(document).on('change', '#report_families_form #resource_report_id', this.showHideSections);
  }

  this.startListening = function () {
    var self = this
    $(document).on('ajax:complete', function (_, data) {
      if ($('#report_families_form').size() > 0) {
        $('#report_families_form #resource_report_id').change();
      }
    });
  }

  this.showHideSections = function (event) {
    const value = $('#report_families_form #resource_report_id').val()
    const provider = $('#report_families_form #resource_report_id').find(`option[value=${value}]`).data('provider')

    this.showHideFieldsForHogan(provider)
  }.bind(this)

  this.showHideFieldsForHogan = function (provider) {
    $('#report_families_form').find('.hogan:not(.' + provider + ')').addClass('hidden').find(":input").attr('disabled', true)
    $('#report_families_form').find('.' + provider + ':not(.internal)').removeClass('hidden').find(":input").removeAttr('disabled')
  }
}

$(function () {
  if ($('#administration #report_families_index').size() > 0) {
    const ReportFamiliesFormObj = new ReportFamiliesForm()
    ReportFamiliesFormObj.init();
  }
});
