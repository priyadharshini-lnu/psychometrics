# frozen_string_literal: true

module Administration
  class UserDetailSerializer < ActiveModel::Serializer
    attributes :id, :full_name, :email, :created_at, :last_sign_in_at, :campaigns, :started_at, :completed_at,
               :completion_status, :status, :additional_time, :active, :hogan_id, :permissions

    has_many :user_assessments, serializer: Administration::UserAssessmentSerializer
    has_many :user_reports, serializer: Administration::UserReportSerializer

    delegate :active, :completion_status, :additional_time, to: :campaign_user

    def status
      campaign_user.real_status
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

    def campaigns
      object.campaigns.map { |c| c.slice(:id, :name, :campaign_options) }
    end

    def user_assessments
      object.user_assessments.where(campaign: campaign).includes(
        :users_result,
        :norm,
        :pearson_user_assessment,
        :saville_user_assessment,
        assessment: %i[pearson_assessment_setting saville_assessment_setting dimension norms]
      )
    end

    def user_reports
      object.user_reports.where(campaign: campaign).includes(:report, :report_family)
    end

    def permissions
      GetPermissionsHash.call!(
        Administration::Campaigns::UserPolicy,
        current_user,
        object,
        [
          'add_report',
          'regenerate_report',
          'toggle_status',
          %w[remove destroy]
        ],
        {
          project_id: campaign.project_id,
          campaign_id: campaign.id
        }
      )
    end

    def hogan_id
      object.hogan_credential&.participant_id
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
