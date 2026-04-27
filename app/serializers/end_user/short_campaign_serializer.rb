# frozen_string_literal: true

module EndUser
  class ShortCampaignSerializer < Panko::Serializer
    include SystemCheckSessions::SystemCheckStatusSerializable

    attributes :id, :name, :type, :status, :completion_percentage, :progress_status, :user_reports_available,
               :description, :timing, :scheduled_at, :scheduled_in, :is_system_check_enabled,
               :allow_continue_with_warning, :skip_assessment_level_checks,
               :system_check_validity, :system_check_status

    delegate :scheduled_at, :scheduled_in, to: :campaign_user, allow_nil: true
    delegate :system_check_validity, to: :object

    def completion_percentage
      uas = context[:current_user].user_assessments.where(campaign: object)
      completed_count = uas.count(&:completed?)
      return 0 unless uas.length.positive?

      (completed_count / uas.length.to_f) * 100
    end

    def progress_status
      campaign_user.completion_status
    end

    def user_reports_available
      object.user_reports.exists?(user_id: context[:current_user], user_access: true)
    end

    def description
      object.campaign_options.description
    end

    def timing
      object.fixed_timed? ? object.fixed_time_duration : nil
    end

    def campaign_user
      object.campaign_users.find_by(user_id: context[:current_user])
    end

    def is_system_check_enabled
      object.system_check_enabled?
    end

    def allow_continue_with_warning
      object.allow_continue_with_warning?
    end

    def skip_assessment_level_checks
      object.skip_assessment_level_checks?
    end

    def system_check_status # rubocop:disable Lint/UselessMethodDefinition
      super
    end

    private

    def system_check_campaign
      object
    end

    def system_check_campaign_user
      campaign_user
    end
  end
end
