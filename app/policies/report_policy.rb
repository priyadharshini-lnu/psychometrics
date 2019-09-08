# frozen_string_literal: true

class ReportPolicy < BasePolicy
  def show?
    return false if @current_user.is_anonym?

    include_report = if @current_project.end_level?
                       @current_membership.report_ids.include?(@record.id)
                     else
                       @current_membership.clients_report_ids.include?(@record.id)
                     end
    reports_accesses = ReportsAccess.where(report: @record, membership: @current_membership, user_access: true)

    include_report && reports_accesses.exists?
  end

  def export?
    @current_project.end_level? ?
      @current_membership.reports.exists?(id: @record.id) :
      @current_membership.clients_reports.exists?(id: @record.id)
  end
end
