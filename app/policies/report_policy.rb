class ReportPolicy < BasePolicy
  def show?
    assign_exists = @current_user.assigns.completed.exists?(assessment_id: @record.assessment_id, client_id: @current_client.id)
    client_report_exists = ClientReport.exists?(report_id: @record.id, client_id: @current_client.id)
    assign_exists && client_report_exists
  end
end
