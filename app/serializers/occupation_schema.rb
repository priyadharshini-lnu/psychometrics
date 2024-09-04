# frozen_string_literal: true

# rubocop:disable Lint/UnderscorePrefixedVariableName

class OccupationSchema < BaseSchema
  def self.schema(_, _)
    Dry::Schema.JSON do
      config.validate_keys = true

      optional(:id).filled(:int?)
      optional(:name).filled(:str?)
      optional(:description).maybe(:str?)
      optional(:factors).array(OccupationsFactorSchema.schema(_, _))
      optional(:full_description).maybe(:str?)
      optional(:potential_areas_of_study).maybe(:str?)
      optional(:icon).maybe(:str?)
      optional(:key_career_tracks).maybe(:str?)
      optional(:high_school_entry_roles).maybe(:str?)
      optional(:diploma_qualification).maybe(:str?)
      optional(:bachelors_or_masters_qualification).maybe(:str?)
      optional(:work_environment).maybe(:str?)
      optional(:alternative_icon).maybe(:str?)
      optional(:indicative_roles_image).maybe(:str?)
      optional(:key_career_tracks_image).maybe(:str?)
      optional(:color).maybe(:str?)
    end
  end
end

# rubocop:enable Lint/UnderscorePrefixedVariableName
