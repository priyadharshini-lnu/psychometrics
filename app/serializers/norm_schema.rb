# frozen_string_literal: true

class NormSchema < BaseSchema
  def self.schema(_, _)
    Dry::Schema.JSON do
      config.validate_keys = true

      required(:id) { int? | str? }
      required(:name).filled(:str?)
      required(:norm_type).maybe(:str?)
    end
  end
end
