# frozen_string_literal: true

module Reports
  module ResultTypes
    class CampaignFactor < BaseType
      def call
        result = context.campaign_factor_value(data['code'])
        {
          key: data['id'],
          name: data['label'],
          value: factor_value(result),
          config_data: data
        }
      end

      def factor_value(result)
        return nil if result.blank?

        if result.numeric_output_type?
          result.numeric_value
        elsif result.string_output_type?
          result.string_value
        end
      end
    end
  end
end
