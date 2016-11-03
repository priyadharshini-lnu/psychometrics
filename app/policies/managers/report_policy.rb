module Managers
  class ReportPolicy < BasePolicy
    def initialize(context, record)
      @current_user = context[:current_user]
      @user         = context[:user]
      @client       = context[:current_client]
      @record       = [record].flatten.last
    end

    def show?
      assign_exists = @user.assigns.completed.exists?(assessment_id: @record.assessment_id, membership_id: @current_membership.id)
      client_report_exists = ClientReport.exists?(report_id: @record.id, client_id: @client.id)
      assign_exists && client_report_exists && !@record.assessment.psychometric? && valid_hierarchy?
    end

    def valid_hierarchy?
      user_membership = Membership.find_by(client_id: @client.id, user_id: @user.id)
      user_membership.user_id == @current_user.id || user_membership.parent.try(:user_id) == @current_user.id
    end
  end
end
