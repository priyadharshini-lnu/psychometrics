module Managers
  class ReportPolicy < BasePolicy
    def initialize(context, record)
      @current_membership = context[:current_membership]
      @client = context[:current_client]
      @user_membership = context[:user_membership]
      @record = [record].flatten.last
    end

    def show?
      assign_exists = @user_membership.assigns.completed.exists?(assessment_id: @record.assessment_id)
      client_report_exists = @user_membership.report_ids.include? @record.id
      assign_exists && client_report_exists && !@record.assessment.psychometric? && valid_hierarchy?
    end

    def valid_hierarchy?
      @user_membership.id == @current_membership.id || @user_membership.parent_id == @current_membership.id
    end
  end
end
