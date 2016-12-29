module AssessmentHelper

  def filter_reports_by_type(reports, type)
    return reports unless type
    report_by_type = reports.find {|r| r.type == type.downcase }
    if report_by_type
      return [report_by_type]
    end
    reports
  end
end
