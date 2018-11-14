class ReportDecorator < BaseDecorator
  def type
    I18n.t("administration.reports.types.#{object.type}")
  end

  def clients_names
    object.clients.
      map { |client| client.decorate.display_name }.
      join(', ')
  end

  def report_families
    object.report_families.present? ? object.report_families.distinct.map{|rf| rf.decorate.display_name}.join('<br>').html_safe : ''
  end

  def assessments_names
    assessments.map { |assessment| assessment&.decorate&.display_name }.join(', ')
  end

  # Returns JSON for confirmation popup
  #
  def detach_confirmation
    {
      title: I18n.t("administration.#{object.class.model_name.plural}.resource.confirmations.detach.title", name: display_name),
      body: I18n.t("administration.#{object.class.model_name.plural}.resource.confirmations.detach.body")
    }.to_json
  end

  # Returns JSON for confirmation popup
  #
  def remove_from_bundle_confirmation
    {
      title: I18n.t("administration.report_families.reports.resource.confirmations.delete.title", name: display_name),
      body: I18n.t("administration.report_families.reports.resource.confirmations.delete.body")
    }.to_json
  end
end
