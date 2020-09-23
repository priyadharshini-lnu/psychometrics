# frozen_string_literal: true

module Administration
  class UserDetailSerializer < ActiveModel::Serializer
    attributes :id, :full_name, :email, :created_at, :last_sign_in_at, :active, :campaigns
    has_many :user_assessments, serializer: Administration::UserAssessmentSerializer
    has_many :user_reports, serializer: Administration::UserReportSerializer

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

    def campaigns
      object.campaigns.map { |c| c.slice(:id, :name) }
    end

    def user_assessments
      object.user_assessments.where(campaign: campaign).includes(:users_result, assessment: [:reports])
    end

    def user_reports
      object.user_reports.where(campaign: campaign).includes(:report, :report_family)
    end

    def active
      object.campaign_users.find { |cu| cu.campaign_id == campaign.id }.active
    end

    private

    def campaign
      @instance_options[:campaign]
    end
  end
end
