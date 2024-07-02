# frozen_string_literal: true

# rubocop:disable Metrics/BlockLength

module Threesixty
  module EndUser
    class ShortCampaignSchema < BaseSchema
      def self.schema(_, _)
        Dry::Schema.JSON do
          config.validate_keys = true

          required(:id).filled(:int?)
          required(:type).filled(:str?)
          required(:timing).maybe(:str?)
          required(:assessment_name).filled(:str?)
          required(:evaluations_counters).maybe do
            hash do
              required(:total_evaluators).filled(:int?)
              required(:total_evaluations).filled(:int?)
              required(:completed_evaluations).filled(:int?)
              required(:completed_evaluators).filled(:int?)
            end
          end
          required(:nominations_counters).maybe do
            hash do
              required(:total_nominations).filled(:int?)
              required(:completed_nominations).filled(:int?)
            end
          end
          required(:reports_counters).maybe do
            hash do
              required(:total_reports).filled(:int?)
              required(:completed_reports).filled(:int?)
            end
          end
          required(:status).maybe(:str?)
          required(:scheduled_at).maybe(:str?)
          required(:scheduled_in).maybe(:str?)
        end
      end
    end
  end
end

# rubocop:enable Metrics/BlockLength
