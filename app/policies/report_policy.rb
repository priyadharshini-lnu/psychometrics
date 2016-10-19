class ReportPolicy < Administration::BasePolicy
  def initialize(context, record)
    @user = context.user
    @client = context.client
    @record = record
  end

  def show?
    assign = @user.assigns.where(assessment_id: @record.assessment_id, client_id: @client.id).first
    client_report_exists = ClientsReport.exists?(report_id: @record.id, client_id: @client.id)
    assign && client_report_exists && assign.completed?
  end
end
