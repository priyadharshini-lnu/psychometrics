# frozen_string_literal: true

# rubocop:disable Metrics/AbcSize
# rubocop:disable Metrics/BlockLength
# rubocop:disable Lint/UnderscorePrefixedVariableName

class ReportSchema < BaseSchema
  def self.schema(_, _)
    Dry::Schema.JSON do
      config.validate_keys = false

      required(:id).filled(:int?)
      required(:name).filled(:str?)
      required(:disabled).filled(:bool?)
      required(:created_at).filled(:str?)
      required(:factors).maybe(:hash?)
      required(:factor_norms).maybe(:hash?)
      required(:occupations).hash(OccupationSchema.schema(_, _))
      required(:props).maybe(:hash?)
      required(:dimension_ids).filled(:array?).each(:int?)
      required(:completed_assessments).filled(:array?)
      required(:data_configuration).maybe(:hash?)
      required(:data_sheet_columns).maybe(:array?)
      required(:relationships).array(RelationshipSchema.schema(_, _))
      required(:category).filled(:str?)
      required(:pages).array(Reports::PageSchema.schema(_, _))
      required(:innovation_styles).hash(InnovationStyleSchema.schema(_, _))
      required(:result_completed_at).maybe(:str?)
      required(:norm_used).maybe(:hash?)
      required(:result_locale).maybe(:hash?)
      required(:default_language).hash do
        required(:code).filled(:str?)
        required(:name).filled(:str?)
        required(:direction).filled(:str?)
      end
      required(:locales).maybe(:hash?)
      required(:campaign_factors).maybe(:array?)
      required(:module_overrides).array(TextModuleOverrideSchema.schema(_, _))
      required(:filters).array(Reports::FilterSchema.schema(_, _))
      required(:assessments).array(Reports::AssessmentSchema.schema(_, _))
    end
  end
end

# rubocop:enable Metrics/AbcSize
# rubocop:enable Metrics/BlockLength
# rubocop:enable Lint/UnderscorePrefixedVariableName
