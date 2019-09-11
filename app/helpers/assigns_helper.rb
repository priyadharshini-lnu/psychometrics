# frozen_string_literal: true

module AssignsHelper
  def show_single_assign?(assign)
    if assign.project_assign_id.present?
      assign.multiple_reports.blank? || assign.multiple_reports.present? && assign.single_reports.present?
    else
      reports = Report.where(id: AssignsReport.where(assign: assign.original_assigns).pluck(:report_id))
      reports.multiple.blank? || reports.multiple.present? && reports.single.present?
    end
  end
end
