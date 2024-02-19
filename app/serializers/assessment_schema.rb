# frozen_string_literal: true

# rubocop:disable Metrics/AbcSize
# rubocop:disable Metrics/BlockLength
# rubocop:disable Lint/UnderscorePrefixedVariableName

class AssessmentSchema < BaseSchema
  def self.schema(_, _)
    Dry::Schema.JSON do
      config.validate_keys = false

      required(:id).filled(:int?)
      required(:name).filled(:str?)
      required(:category).filled(:str?)
      required(:disabled).filled(:bool?)
      required(:created_at).filled(:str?)
      required(:flow).filled(:hash?)
      required(:norm_rules).value { hash? | array? | nil? }
      required(:factors).array(Factors::WithSubFactorsSchema.schema(_, _))
      required(:dimension_id).filled(:int?)
      required(:enable_back).filled(:bool?)
      required(:enable_progress).filled(:bool?)
      required(:data_sheet_columns).maybe(:array?)
      required(:relationships).array(RelationshipSchema.schema(_, _))
      required(:blocks).array(BlockSchema.schema(_, _))
      required(:timer_duration).value { int? | float? | nil? }
      required(:resources_content).array(QuestionSchema.schema(_, _))
      required(:resources_translations).maybe(:hash?)
      required(:instructions).maybe do
        hash do
          optional(:enabled).filled(:bool?)
          optional(:content).filled(:str?)
        end
      end
      required(:fixed_timed).maybe(:bool?)
      required(:options).maybe(:hash?)
      required(:default_norm_id).maybe(:int?)
      required(:extra).hash do
        optional(:timer).maybe(:str?)
        optional(:icon_color).maybe(:str?)
        optional(:enable_video_check).maybe(:bool?)
        optional(:enable_audio_check).maybe(:bool?)
        optional(:enable_network_check).maybe(:bool?)
      end
      required(:linked_questions).maybe(:hash?)
      required(:allow_multiple_responses).maybe(:bool?)
    end
  end
end

# rubocop:enable Metrics/AbcSize
# rubocop:enable Metrics/BlockLength
# rubocop:enable Lint/UnderscorePrefixedVariableName
