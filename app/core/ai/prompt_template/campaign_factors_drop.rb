# frozen_string_literal: true

module AI
  module PromptTemplate
    class CampaignFactorsDrop < Liquid::Drop
      include Enumerable

      def initialize(campaign, user = nil)
        @campaign = campaign
        @user = user
      end

      def liquid_method_missing(method)
        # Handle individual factor access by code
        factor = campaign_factors_by_code[method.to_s]
        if factor
          campaign_factor_drop(factor)
        end
      end

      # WARNING: This loads all factors into memory, better to filter using available methods
      def each
        campaign_factors.each do |factor|
          yield campaign_factor_drop(factor)
        end
      end

      delegate :size, to: :campaign_factors

      # Return as array for templates that need array access
      # WARNING: This loads all factors into memory, better to filter using available methods
      def to_a
        campaign_factors.map do |factor|
          campaign_factor_drop(factor)
        end
      end

      def by_group(group_name)
        filtered_factors = @campaign.campaign_factors.
                           joins(:campaign_factor_group).
                           where(campaign_factor_groups: { name: group_name })

        filtered_factors.map { |factor| campaign_factor_drop(factor) }
      end

      def by_codes(codes_array)
        filtered_factors = @campaign.campaign_factors.where(code: codes_array)
        filtered_factors.map { |factor| campaign_factor_drop(factor) }
      end

      private

      def campaign_factors
        @campaign_factors ||= @campaign.campaign_factors
      end

      def campaign_factors_by_code
        @campaign_factors_by_code ||= campaign_factors.index_by(&:code)
      end

      def campaign_factor_drop(factor)
        @campaign_factor_drops ||= {}
        @campaign_factor_drops[factor.id] ||= AI::PromptTemplate::CampaignFactorDrop.new(factor, @user)
      end
    end
  end
end
