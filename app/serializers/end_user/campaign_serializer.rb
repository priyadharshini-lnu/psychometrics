# frozen_string_literal: true

module EndUser
  class CampaignSerializer < ActiveModel::Serializer
    include Rails.application.routes.url_helpers
    attributes :id, :name, :type, :status, :start_date, :end_date,
               :groups, :ungrouped_assessments_ids, :campaign_user, :status,
               :is_timed_campaign

    has_one :campaign_options, serializer: ::EndUser::CampaignOptionsSerializer
    has_many :user_assessments, serializer: ::EndUser::UserAssessmentSerializer
    has_many :user_reports, serializer: ::EndUser::UserReportSerializer
    has_many :groups, serializer: ::EndUser::GroupSerializer
    has_one :campaign_user, serializer: ::EndUser::CampaignUserSerializer

    def is_timed_campaign # rubocop:disable Naming/PredicateName
      object.timed?
    end

    def status
      object.real_status
    end

    def groups
      object.campaign_assessment_groups.order(:position)
    end

    def user_assessments
      UserAssessment.where(evaluator_id: current_user.id, campaign_id: object.id).
        joins(:assessment).where.not(assessments: { category: :mindmill })
    end

    def user_reports
      object.user_reports.eager_load(:report).
        where(user_id: current_user.id, user_access: true).
        merge(Report.assignable)
    end

    def campaign_user
      object.campaign_users.find_by(user_id: current_user.id)
    end

    def ungrouped_assessments_ids
      object.campaign_assessments.ungrouped.order(:position).map(&:assessment_id)
    end

    private

    def current_user
      @current_user ||= instance_options[:current_user]
    end
  end
end
