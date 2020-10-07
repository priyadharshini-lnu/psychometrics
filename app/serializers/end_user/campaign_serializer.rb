# frozen_string_literal: true

module EndUser
  class CampaignSerializer < ActiveModel::Serializer
    include Rails.application.routes.url_helpers
    attributes :id, :name, :type, :status, :groups, :ungrouped_assessments_ids

    has_many :user_assessments, serializer: ::EndUser::UserAssessmentSerializer
    has_many :user_reports, serializer: ::EndUser::UserReportSerializer
    has_many :groups, serializer: ::EndUser::GroupSerializer

    def groups
      object.campaign_assessment_groups.order(:position)
    end

    def user_assessments
      UserAssessment.where(evaluator_id: current_user.id, campaign_id: object.id)
    end

    def user_reports
      object.user_reports.eager_load(:report).
        where(user_id: current_user.id, user_access: true).
        merge(Report.assignable)
    end

    def current_user
      @current_user ||= instance_options[:current_user]
    end

    def ungrouped_assessments_ids
      object.campaign_assessments.ungrouped.order(:position).map(&:assessment_id)
    end
  end
end
