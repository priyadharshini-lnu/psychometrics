# frozen_string_literal: true

module AI
  module PromptTemplate
    class CampaignFactorDrop < Liquid::Drop
      def initialize(campaign_factor, user = nil)
        @campaign_factor = campaign_factor
        @user = user
      end

      delegate :name, to: :@campaign_factor

      delegate :code, to: :@campaign_factor

      delegate :description, to: :@campaign_factor

      delegate :output_type, to: :@campaign_factor

      delegate :factor_type, to: :@campaign_factor

      delegate :position, to: :@campaign_factor

      def value
        campaign_factor_value&.value
      end

      def numeric_value
        campaign_factor_value&.numeric_value
      end

      def string_value
        campaign_factor_value&.string_value
      end

      private

      def campaign_factor_value
        return @campaign_factor_value if defined?(@campaign_factor_value)

        @campaign_factor_value = CampaignFactorValue.find_by(
          campaign_factor: @campaign_factor,
          user: @user
        )
      end
    end
  end
end
