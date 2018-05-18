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
end
