# frozen_string_literal: true

module Administration
  class UserDetailSerializer < Panko::Serializer
    attributes :id, :full_name, :email, :created_at, :last_sign_in_at, :campaigns, :started_at,
               :completion_status, :status, :additional_time, :active, :hogan_id, :permissions, :completed_at,
               :proctoring_sessions, :user_assessments, :user_reports

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
      query = object.user_assessments.where(campaign: campaign).includes(
        :users_result,
        :norm,
        :pearson_user_assessment,
        :saville_user_assessment,
        assessment: %i[dimension norms]
      )
      if current_user.has_permission?(:assessors, :view, campaign_id: campaign.id)
        query
      else
        query = query.where.not(relationship_id: Relationship.assessor_relationship.id)
      end
      Panko::ArraySerializer.new(
        query,
        each_serializer: Administration::UserAssessmentSerializer,
        context: {
          current_user: current_user,
          campaign: campaign
        }
      ).to_a
    end

    def user_reports
      user_reports = object.user_reports.where(campaign: campaign).includes(:report, :report_family)
      Panko::ArraySerializer.new(
        user_reports,
        each_serializer: Administration::UserReportSerializer,
        context: {
          current_user: current_user,
          campaign: campaign
        }
      ).to_a
    end

    def proctoring_sessions
      proctoring_sessions = campaign_user.proctoring_sessions.order(started_at: :desc)

      Panko::ArraySerializer.new(
        proctoring_sessions,
        each_serializer: Administration::ProctoringSessionSerializer
      ).to_a
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
      context[:campaign]
    end

    def current_user
      context[:current_user]
    end

    def campaign_user
      object.campaign_users.find { |cu| cu.campaign_id == campaign.id }
    end
  end
end
