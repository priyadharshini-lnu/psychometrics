# frozen_string_literal: true

module Threesixty
  module EndUser
    class ShortCampaignSerializer < Threesixty::EndUser::BaseCampaignSerializer
      attributes :id, :type, :timing, :assessment_name, :evaluations_counters, :nominations_counters,
                 :reports_counters, :status, :start_date

      delegate :campaign, to: :object
      delegate :start_date, :status, to: :campaign

      def timing
        object.assessment.timing
      end
    end
  end
end
