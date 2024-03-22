# frozen_string_literal: true

class SkillGapReportSchema < BaseSchema
  # rubocop:disable Lint/UnderscorePrefixedVariableName
  def self.schema(_, _)
    Dry::Schema.JSON do
      config.validate_keys = true

      required(:id).filled(:int?)
      optional(:datasheet_fields).maybe do
        array do
          hash do
            required(:field).filled(:str?)
            required(:value).filled(:str?)
          end
        end
      end
      optional(:profile_fields).maybe do
        array do
          hash do
            required(:field).filled(:str?)
            required(:value).filled(:str?)
          end
        end
      end
      required(:idp_template_skills).filled do
        array(EndUser::IdpTemplateSkillSchema.schema(_, _))
      end
    end
  end
  # rubocop:enable Lint/UnderscorePrefixedVariableName
end
