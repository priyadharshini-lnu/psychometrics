# frozen_string_literal: true

module EndUser
  class CampaignSerializer < ActiveModel::Serializer
    include Rails.application.routes.url_helpers
    attributes :id, :name, :type, :status, :start_date, :end_date,
               :groups, :ungrouped_assessments_ids

    has_one :campaign_options, serializer: ::EndUser::CampaignOptionsSerializer
    has_one :campaign_user, serializer: ::EndUser::CampaignUserSerializer
    has_many :user_assessments, serializer: ::EndUser::UserAssessmentSerializer
    has_many :user_reports, serializer: ::EndUser::UserReportSerializer
    has_many :groups, serializer: ::EndUser::GroupSerializer

    def status
      return object.status unless object.fixed_time?
      return object.status unless campaign_user.started_at

      expected_end_time = campaign_user.started_at + object.fixed_time_duration.minutes
      return 'closed' if expected_end_time < Time.now && object.active?

      object.status
    end

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

    def campaign_user
      object.campaign_users.find_by(user_id: current_user.id)
    end

    def current_user
      @current_user ||= instance_options[:current_user]
    end

    def ungrouped_assessments_ids
      object.campaign_assessments.ungrouped.order(:position).map(&:assessment_id)
    end
  end
end
