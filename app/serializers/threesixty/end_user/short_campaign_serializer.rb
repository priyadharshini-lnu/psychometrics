# frozen_string_literal: true

module Threesixty
  module EndUser
    class ShortCampaignSerializer < Threesixty::EndUser::BaseCampaignSerializer
      attributes :id, :type, :timing, :assessment_name, :evaluations_counters, :nominations_counters,
                 :reports_counters, :status, :scheduled_at, :scheduled_in

      delegate :campaign, to: :object
      delegate :scheduled_at, :scheduled_in, to: :campaign_user, allow_nil: true

      def timing
        object.assessment.timing
      end

      def campaign_user
        object.campaign_users.find_by(user_id: context[:current_user])
      end
    end
  end
end
