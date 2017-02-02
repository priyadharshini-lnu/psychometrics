class LicenseDecorator < BaseDecorator
  def display_name
    if object.assign_individual_assessment?
      object.assessment.decorate.display_name
    elsif object.assign_individual_report?
      object.report.decorate.display_name
    else
      object.type.humanize.titleize
    end
  end

  def used_number
    object.unlimited? ?
      I18n.t('administration.clients.licenses.show.unlimited') :
      I18n.t('administration.clients.licenses.show.used_out_of', used_number: object.used_number - object.used_overuse_number, number: object.number)
  end

  def used_overuse_number
    object.unlimited? ?
      I18n.t('administration.clients.licenses.show.unlimited') :
      I18n.t('administration.clients.licenses.show.used_out_of', used_number: object.used_overuse_number, number: object.overuse_number)
  end
end
