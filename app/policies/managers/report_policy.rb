module Managers
  class ReportPolicy < BasePolicy
    def initialize(context, record)
      @current_user = context[:current_user]
      @user         = context[:user]
      @client       = context[:current_client]
      @record       = [record].flatten.last
    end

    def show?
      # TODO: check current_user and user (hierarchy)
      assign_exists        = @user.assigns.completed.exists?(assessment_id: @record.assessment_id, client_id: @client.id)
      client_report_exists = ClientsReport.exists?(report_id: @record.id, client_id: @client.id)
      assign_exists && client_report_exists && !@record.assessment.psychometric?
    end
  end
end
