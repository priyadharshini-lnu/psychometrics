# frozen_string_literal: true

module AI
  module PromptTemplate
    class CampaignDrop < Liquid::Drop
      def initialize(campaign)
        @campaign = campaign
      end

      delegate :id, to: :@campaign

      delegate :name, to: :@campaign

      delegate :type, to: :@campaign
    end
  end
end
