module Managers
  class ReportPolicy < BasePolicy
    def initialize(context, record)
      @current_membership = context[:current_membership]
      @client = context[:current_client]
      @user_membership = context[:user_membership]
      @record = [record].flatten.last
    end

    def show?
      assessment_ids = Assessment.enabled.
          joins('LEFT JOIN assigns on assigns.assignable_id = assessments.id and assigns.assignable_type = \'Assessment\'').
          where(assigns: { role: 'manager', membership_id: @current_membership.id }).pluck(:id)
      assign = @user_membership.assigns.find_by(assessment: @record.assessment)
      report_existing = assign.reports.enabled.include? @record
      assessment_ids && report_existing && !@record.assessment.psychometric? && valid_hierarchy?
    end

    def valid_hierarchy?
      @user_membership.id == @current_membership.id || @user_membership.parent_id == @current_membership.id
    end
  end
end
