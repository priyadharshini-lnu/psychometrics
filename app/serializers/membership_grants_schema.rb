# frozen_string_literal: true

class MembershipGrantsSchema < BaseSchema
  def self.schema(_, _)
    Dry::Schema.JSON do
      config.validate_keys = true

      required(:id).filled(:int?)
      required(:membership_id).filled(:int?)
      required(:data).hash do
        AllowedPermissions::CLIENT_ADMIN_PERMISSIONS.each_key do |grant_name|
          optional(grant_name.to_sym).maybe(:array).each(:str?)
        end
      end
    end
  end
end
