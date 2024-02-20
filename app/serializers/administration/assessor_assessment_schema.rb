# frozen_string_literal: true

module Administration
  class AssessorAssessmentSchema < BaseSchema
    def self.schema(_, _)
      Dry::Schema.JSON do
        config.validate_keys = true

        required(:id).filled(:int?)
        required(:name).filled(:str?)
        required(:permissions).hash do
          required(:import_results).filled(:bool?)
          required(:export_raw_results).filled(:bool?)
          required(:export_scoring_results).filled(:bool?)
          required(:export_raw_factor_scores).filled(:bool?)
          required(:export_normed_results).filled(:bool?)
          required(:export_external_results).filled(:bool?)
          required(:rescore_responses).filled(:bool?)
        end
        required(:linked_assessment_name).maybe(:str?)
      end
    end
  end
end
