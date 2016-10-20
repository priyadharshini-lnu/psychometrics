class ReportPolicy < BasePolicy
  def show?
    assign_exists = @user.assigns.completed.exists?(assessment_id: @record.assessment_id, client_id: @client.id)
    client_report_exists = ClientsReport.exists?(report_id: @record.id, client_id: @client.id)
    assign_exists && client_report_exists
  end
end