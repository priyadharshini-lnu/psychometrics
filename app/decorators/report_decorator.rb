class ReportDecorator < BaseDecorator
  def type
    I18n.t("administration.reports.types.#{object.type}")
  end

  def clients_names
    object.clients.
      map { |client| client.decorate.display_name }.
      join(', ')
  end

  def report_family
    object.report_family.present? ? object.report_family.decorate.display_name : ''
  end
end
