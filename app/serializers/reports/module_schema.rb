# frozen_string_literal: true

module Reports
  class ModuleSchema < BaseSchema
    def self.schema(_, _)
      Dry::Schema.JSON do
        config.validate_keys = false

        required(:id).filled(:int?)
        required(:name).maybe(:str?)
        required(:position).filled(:int?)
        required(:props).maybe(:hash?)
        required(:type).maybe(:str?)
        required(:assessment_id).filled(:int?)
        required(:meta).hash do
          optional(:hidden).filled(:bool?)
          optional(:locked).maybe(:bool?)
        end
      end
    end
  end
end
