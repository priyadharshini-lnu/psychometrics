class ReportDecorator < BaseDecorator
  def type
    I18n.t("administration.reports.types.#{object.type}")
  end

  def clients_names
    object.clients.
      map { |client| client.decorate.display_name }.
      join(', ')
  end
end
