# frozen_string_literal: true

module EndUser
  class CampaignSerializer < Panko::Serializer
    include Rails.application.routes.url_helpers
    include SystemCheckSessions::SystemCheckStatusSerializable

    attributes :id, :name, :type, :status, :start_date, :end_date,
               :groups, :ungrouped_assessments_ids, :campaign_user, :status,
               :is_timed_campaign, :campaigns_count, :user_reports_available,
               :privacy_consent_required, :campaign_time, :fixed_timed, :workshop_invites, :workshops,
               :user_assessments, :practice_campaign, :last_successful_check_at, :threesixty_campaign_id,
               :system_check_status

    has_one :campaign_options, serializer: ::EndUser::CampaignOptionsSerializer

    def workshop_invites
      workshop_invite_records = object.workshop_invites.joins(:workshop_invited_subjects).where(
        workshop_invited_subjects: { user_id: current_user.id, status: :pending },
        campaign_id: object.id
      ).order(:created_at)

      return nil unless workshop_invite_records

      Panko::ArraySerializer.new(
        workshop_invite_records,
        context: { current_user: current_user },
        each_serializer: ::EndUser::WorkshopInviteSerializer
      ).to_a
    end

    def workshops
      workshops = Workshop.visible_to_end_user(current_user.id).where(campaign_id: object.id)

      return nil unless workshops

      Panko::ArraySerializer.new(
        workshops,
        context: { current_user: current_user },
        each_serializer: ::EndUser::ShortWorkshopSerializer
      ).to_a
    end

    def privacy_consent_required
      object.project.privacy_setting.privacy_consent &&
        !current_user.privacy_consents.exists?(version: Settings.privacy_policy_version)
    end

    def fixed_timed
      object.fixed_timed?
    end

    def is_timed_campaign
      object.timed?
    end

    def status
      return 'closed' unless current_campaign_user.in_schedule?

      object.real_status
    end

    def groups
      group_records = object.campaign_assessment_groups.order(:position).includes(:campaign_assessments, :translations)
      Panko::ArraySerializer.new(group_records, each_serializer: ::EndUser::GroupSerializer).to_a
    end

    def user_assessments
      user_assessments = UserAssessment.where(evaluator_id: current_user.id, campaign_id: object.id).
                         includes(assessment: {
                           translations: [], icon_attachment: :blob, linked_assessor_form: [], agile: []
                         }, users_result: [], campaign: [], evaluator: [])

      Panko::ArraySerializer.new(
        user_assessments,
        each_serializer: ::EndUser::UserAssessmentSerializer,
        context: {
          current_user: context[:current_user]
        }
      ).to_a
    end

    def campaign_user
      campaign_user_record = current_campaign_user

      return nil unless campaign_user_record

      ::EndUser::CampaignUserSerializer.new(
        context: {}
      ).serialize(campaign_user_record)
    end

    def current_campaign_user
      object.campaign_users.find_by(user_id: current_user.id)
    end

    def ungrouped_assessments_ids
      object.campaign_assessments.ungrouped.order(:position).map(&:assessment_id)
    end

    def campaigns_count
      current_user.campaigns.visible_to_end_user.count
    end

    def user_reports_available
      object.user_reports.exists?(user_id: current_user.id, user_access: true)
    end

    def threesixty_campaign_id
      return nil unless object.type == 'threesixty'

      ::Threesixty::Campaign.find_by(campaign_id: object.id)&.id
    end

    def campaign_time
      return unless object.fixed_time?
      return current_campaign_user.additional_time / 60 if current_campaign_user.interrupted_campaign?

      object.fixed_time_duration / 60 if current_campaign_user.not_started_campaign?
    end

    def last_successful_check_at
      return nil unless object.system_check_enabled?
      return nil if current_campaign_user.nil?

      SystemCheckSessions::GetLastSuccessfulCheckAt.new(campaign_user: current_campaign_user).query
    end

    def system_check_status # rubocop:disable Lint/UselessMethodDefinition
      super
    end

    private

    def current_user
      context[:current_user]
    end

    def system_check_campaign
      object
    end

    def system_check_campaign_user
      current_campaign_user
    end
  end
end
