# frozen_string_literal: true

module Administration
  module Campaigns
    class OtherAssessmentSchema < BaseSchema
      def self.schema(_, _)
        Dry::Schema.JSON do
          config.validate_keys = true

          required(:id).filled(:int?)
          required(:name).filled(:str?)
          required(:category).filled(:str?)
          required(:permissions).hash do
            required(:import_results).filled(:bool?)
            required(:export_raw_results).filled(:bool?)
            required(:export_scoring_results).filled(:bool?)
            required(:export_raw_factor_scores).filled(:bool?)
            required(:export_normed_results).filled(:bool?)
            required(:export_external_results).filled(:bool?)
            required(:rescore_responses).filled(:bool?)
            required(:update_external_config).filled(:bool?)
            required(:schedule_assessment).filled(:bool?)
          end
          required(:owner).maybe do
            hash do
              required(:id).filled(:int?)
              required(:name).filled(:str?)
            end
          end
          required(:dimension_id).maybe(:int?)
          required(:tenant_id).maybe(:int?)
        end
      end
    end
  end
end
