# frozen_string_literal: true

module Administration
  class UserDetailSerializer < ActiveModel::Serializer
    attributes :id, :full_name, :email, :created_at, :last_sign_in_at, :campaigns, :started_at, :completed_at,
               :additional_time

    has_many :user_assessments, serializer: Administration::UserAssessmentSerializer
    has_many :user_reports, serializer: Administration::UserReportSerializer

    attribute :active do
      campaign_user&.active
    end

    attribute :completion_status do
      campaign_user&.completion_status
    end

    def full_name
      object.decorate.full_name
    end

    def created_at
      I18n.l object.created_at, format: :short
    end

    def last_sign_in_at
      return nil unless object.last_sign_in_at

      I18n.l object.last_sign_in_at, format: :short
    end

    def started_at
      return nil unless campaign_user&.started_at

      I18n.l(campaign_user&.started_at, format: :short)
    end

    def completed_at
      return nil unless campaign_user&.completed_at

      I18n.l(campaign_user&.completed_at, format: :short)
    end

    def additional_time
      return nil unless campaign_user&.additional_time

      return "#{campaign_user.additional_time} mins"
    end

    def campaigns
      object.campaigns.map { |c| c.slice(:id, :name) }
    end

    def user_assessments
      object.user_assessments.where(campaign: campaign).includes(:users_result, assessment: [:reports])
    end

    def user_reports
      object.user_reports.where(campaign: campaign).includes(:report, :report_family)
    end

    private

    def campaign
      @instance_options[:campaign]
    end

    def campaign_user
      object.campaign_users.find { |cu| cu.campaign_id == campaign.id }
    end
  end
end
