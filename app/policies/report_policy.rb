class ReportPolicy < BasePolicy
  def show?
    return false if @current_user.is_anonym?
    include_report = if @current_project.end_level?
                       @current_membership.report_ids.include?(@record.id)
                     else
                       @current_membership.clients_report_ids.include?(@record.id)
                     end
    reports_accesses = ReportsAccess.where(report: @record, membership: @current_membership, user_access: true)
    user_access = if @record.single?
                    reports_accesses.exists?
                  else
                    @record.assessments.size == reports_accesses.uniq(&:assessment_id).size
                  end
    include_report && user_access
  end
end
