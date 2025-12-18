# frozen_string_literal: true

module AI
  module PromptTemplate
    module Filters
      # Filter campaign factors by group name
      def campaign_factors_by_group(campaign_factors_drop, group_name)
        return [] if campaign_factors_drop.nil?

        campaign_factors_drop.by_group(group_name)
      end

      # Filter campaign factors by codes array
      def campaign_factors_by_codes(campaign_factors_drop, codes_string)
        return [] if campaign_factors_drop.nil?

        codes = if codes_string.is_a?(Array)
                  codes_string
                else
                  codes_string.to_s.split(',').map(&:strip)
                end

        campaign_factors_drop.by_codes(codes)
      end
    end
  end
end
