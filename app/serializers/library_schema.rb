# frozen_string_literal: true

class LibrarySchema < BaseSchema
  def self.schema(_, _)
    Dry::Schema.JSON do
      config.validate_keys = true

      required(:id).filled(:int?)
      required(:name).filled(:str?)
      required(:description).filled(:str?)
      required(:thumb).maybe(:str?)
      required(:file).maybe(:str?)
      required(:icon).maybe(:str?)
      required(:type).filled(:str?)
      required(:parent_id).maybe(:int?)
      required(:created_at).filled(:str?)
    end
  end
end
