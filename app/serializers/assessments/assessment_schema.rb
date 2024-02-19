# frozen_string_literal: true

# rubocop:disable Lint/UnderscorePrefixedVariableName
# rubocop:disable Metrics/AbcSize
# rubocop:disable Metrics/BlockLength

module Assessments
  class AssessmentSchema < BaseSchema
    def self.schema(_, _)
      Dry::Schema.JSON do
        config.validate_keys = false

        required(:id).filled(:int?)
        required(:name).filled(:str?)
        required(:category).filled(:str?)
        required(:disabled).filled(:bool?)
        required(:created_at).filled(:str?)
        required(:flow).maybe(:hash?)
        required(:norm_rules).maybe(:array?)
        required(:factors).array(Assessments::FactorSchema.schema(_, _))
        required(:enable_back).filled(:bool?)
        required(:enable_progress).filled(:bool?)
        required(:question_recoding).maybe(:array?)
        required(:data_sheet_columns).maybe(:array?)
        required(:relationships).array(RelationshipSchema.schema(_, _))
        required(:extra).filled(:hash?)
        required(:resources).value { nil? | array? }
        required(:resources_data).maybe(:hash?)
        required(:options).maybe(:hash?)
        required(:instructions).value { nil? | hash? }
        required(:default_norm_id).maybe(:int?)
        required(:owner_id).maybe(:int?)
        required(:linked_questions).value { nil? | hash? }
        required(:blocks).array(Assessments::BlockSchema.schema(_, _))
        required(:linked_assessment).maybe do
          hash(Assessments::LinkedAssessmentSchema.schema(_, _))
        end
      end
    end
  end
end

# rubocop:enable Lint/UnderscorePrefixedVariableName
# rubocop:enable Metrics/AbcSize
# rubocop:enable Metrics/BlockLength
