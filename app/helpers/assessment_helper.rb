# frozen_string_literal: true

module AssessmentHelper
  def filter_reports_by_type(reports, type)
    return reports unless type

    reports.select { |r| r.type == type.downcase || r.common? }
  end

  def filter_assigns_reports_by_type(assigns_reports, type)
    return assigns_reports unless type

    assigns_reports.select { |ar| ar.report.type == type.downcase || ar.report.common? }
  end

  def only_assigned_reports(assign, reports_ids)
    filtered_reports = assign.single_reports.select { |report| reports_ids.include?(report.id) && policy(report).show? }
    filter_reports_by_type(filtered_reports, assign.norm_type)
  end
end
