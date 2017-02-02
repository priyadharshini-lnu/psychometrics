class ReportPolicy < BasePolicy
  def show?
    return false if @current_user.is_anonym?
    # TODO: ensure: end user should not have assign without client_assign
    assign = @record.assessment.assigns.includes(:reports).find_by(membership_id: @current_membership.id)
    assign && assign.reports.find { |r| r.id == @record.id }
  end
end
