class ReportPolicy < BasePolicy
  def show?
    return false if @current_user.is_anonym?
    include_report = if @current_project.end_level?
                       @current_membership.report_ids.include?(@record.id)
                     else
                       @current_membership.clients_report_ids.include?(@record.id)
                     end
    include_report && ReportsAccess.where(report: @record, membership: @current_membership, user_access: true).exists?
  end
end
