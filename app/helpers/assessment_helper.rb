module AssessmentHelper

  def filter_reports_by_type(reports, type)
    return reports unless type
    reports.select { |r| r.type == type.downcase || r.common? }
  end

  def only_assigned_reports(assign, reports)
    filtered_reports = reports.try(:[], assign.assessment_id) || []
    filter_reports_by_type(filtered_reports, assign.norm_type).select { |report| policy(report).show? }
  end
end
