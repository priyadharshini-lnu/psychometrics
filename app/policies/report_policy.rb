class ReportPolicy < BasePolicy
  def show?
    return false if @current_user.is_anonym?
    @current_membership.report_ids.include? @record.id
  end
end
