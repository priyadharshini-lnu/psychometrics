# frozen_string_literal: true

module AI
  module PromptTemplate
    class CampaignUserDrop < Liquid::Drop
      def initialize(campaign_user)
        @campaign_user = campaign_user
      end

      delegate :level, to: :@campaign_user
    end
  end
end
