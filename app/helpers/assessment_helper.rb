module AssessmentHelper

  def filter_reports_by_type(reports, type)
    return reports unless type
    report_by_type = reports.select {|r| r.type == type.downcase || r.common? }
    report_by_type
  end
end
