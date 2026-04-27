# frozen_string_literal: true

module Threesixty
  module EndUser
    class ShortCampaignSerializer < Threesixty::EndUser::BaseCampaignSerializer
      include SystemCheckSessions::SystemCheckStatusSerializable

      attributes :id, :type, :timing, :assessment_name, :evaluations_counters, :nominations_counters,
                 :reports_counters, :status, :scheduled_at, :scheduled_in, :is_system_check_enabled,
                 :allow_continue_with_warning, :skip_assessment_level_checks,
                 :system_check_validity, :system_check_status, :progress_status,
                 :campaign_id

      delegate :campaign, to: :object
      delegate :scheduled_at, :scheduled_in, to: :campaign_user, allow_nil: true

      def timing
        object.assessment.timing
      end

      def campaign_user
        object.campaign_users.find_by(user_id: context[:current_user])
      end

      def is_system_check_enabled
        object.campaign.system_check_enabled?
      end

      def allow_continue_with_warning
        object.campaign.allow_continue_with_warning?
      end

      def skip_assessment_level_checks
        object.campaign.skip_assessment_level_checks?
      end

      def system_check_validity
        object.campaign.system_check_validity
      end

      def system_check_status # rubocop:disable Lint/UselessMethodDefinition
        super
      end

      def progress_status
        campaign_user.completion_status
      end

      private

      def system_check_campaign
        object.campaign
      end

      def system_check_campaign_user
        campaign_user
      end
    end
  end
end
