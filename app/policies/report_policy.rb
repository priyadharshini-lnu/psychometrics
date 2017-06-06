class ReportPolicy < BasePolicy
  def show?
    return false if @current_user.is_anonym?
    if @current_project.end_level?
      @current_membership.report_ids.include?(@record.id)
    else
      @current_membership.clients_report_ids.include?(@record.id)
    end
  end
end
