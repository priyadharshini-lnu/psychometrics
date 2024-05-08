# frozen_string_literal: true

class MembershipSchema < BaseSchema
  def self.schema(_, _)
    Dry::Schema.JSON do
      config.validate_keys = true

      required(:id).filled(:str?)
      required(:first_name).filled(:str?)
      required(:last_name).filled(:str?)
      required(:name).filled(:str?)
      required(:role_name).filled(:str?)
      required(:client_name).filled(:str?)
    end
  end
end
