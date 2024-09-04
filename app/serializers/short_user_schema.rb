# frozen_string_literal: true

class ShortUserSchema < BaseSchema
  def self.schema(_, _)
    Dry::Schema.JSON do
      config.validate_keys = true

      required(:id).filled(:int?)
      required(:full_name).filled(:str?)
      required(:avatar_url).maybe(:str?)
    end
  end
end
