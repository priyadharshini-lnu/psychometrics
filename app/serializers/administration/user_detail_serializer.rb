# frozen_string_literal: true

module Administration
  class UserDetailSerializer < Panko::Serializer
    attributes :id, :full_name, :email, :created_at, :last_sign_in_at, :campaigns, :started_at,
               :completion_status, :status, :additional_time, :active, :hogan_id, :hogan_provider, :permissions,
               :completed_at, :proctoring_sessions, :user_assessments, :user_reports, :manager,
               :level, :current_job_role, :target_job_role

    delegate :active, :completion_status, :additional_time, :level, to: :campaign_user, allow_nil: true

    def status
      campaign_user&.real_status
    end

    def full_name
      base_name = object.decorate.full_name
      object.is_uat? ? "UAT - #{base_name}" : base_name
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
        :simulation_user_assessment,
        :project_assessments,
        assessment: %i[owner norms]
      )

      unless current_user.has_permission?(
        :assessors, :view, campaign_id: campaign.id
      )
        query = query.where.not(
          relationship_id: Relationship.assessor_relationship.id
        )
      end

      query.map do |ua|
        UserAssessmentSerializer.new(context: { current_user: current_user, campaign: campaign }).serialize(ua)
      end
    end

    def user_reports
      user_reports = object.user_reports.with_attached_pdf_file.where(
        campaign: campaign
      ).includes(:report_family, report: :owner)
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
      return [] unless campaign_user

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
          'bulk_download',
          'view_workshop_details',
          'view_recordings',
          'view_idp_plan',
          %w[remove destroy]
        ],
        {
          project_id: campaign.project_id,
          campaign_id: campaign.id
        }
      )
    end

    def manager
      return {} unless object.manager

      ::Administration::ManagerSerializer.new.serialize(object.manager)
    end

    def hogan_id
      object.hogan_credential&.participant_id
    end

    def hogan_provider
      object.hogan_credential&.provider
    end

    private

    def campaign
      context[:campaign]
    end

    def current_user
      context[:current_user]
    end

    def campaign_user
      CampaignUser.find_by(user_id: object.id, campaign_id: campaign.id)
    end

    def current_job_role
      return {} unless campaign_user&.current_job_role

      ::Administration::JobRoleSerializer.new.serialize(campaign_user.current_job_role)
    end

    def target_job_role
      return {} unless campaign_user&.target_job_role

      ::Administration::JobRoleSerializer.new.serialize(campaign_user.target_job_role)
    end
  end
end
