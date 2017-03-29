module AssessmentHelper

  def filter_reports_by_type(reports, type)
    return reports unless type
    reports.select { |r| r.type == type.downcase || r.common? }
  end
end
