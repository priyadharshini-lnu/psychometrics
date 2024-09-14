# frozen_string_literal: true

module Reports
  class FilterSchema < BaseSchema
    def self.schema(_, _)
      Dry::Schema.JSON do
        config.validate_keys = false

        required(:id).filled(:int?)
        required(:name).filled(:str?)
        required(:conditions).filled(:array?)
        required(:assessment_id).maybe(:int?)
        required(:min_required_responses).filled(:int?)
      end
    end
  end
end
