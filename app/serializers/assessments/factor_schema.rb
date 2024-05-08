# frozen_string_literal: true

module Assessments
  class FactorSchema < BaseSchema
    def self.schema(_, _)
      Dry::Schema.JSON do
        config.validate_keys = false

        required(:id).filled(:int?)
        required(:name).filled(:str?)
        required(:parent_id).maybe(:int?)
        required(:scoring).maybe(:array?)
        required(:description).maybe(:str?)
        required(:icon).maybe(:str?)
      end
    end
  end
end
