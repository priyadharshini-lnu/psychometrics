class ReportPolicy < BasePolicy
  def show?
    binding.pry
    assign_exists = @current_membership.assigns.completed.exists?(assessment_id: @record.assessment_id, client_id: @current_client.id)
    client_report_exists = ClientReport.exists?(report_id: @record.id, client_id: @current_client.id)
    assign_exists && client_report_exists
  end
end
