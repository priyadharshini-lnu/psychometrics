# frozen_string_literal: true

class MembershipGrantsSchema < BaseSchema
  def self.schema(_, _)
    Dry::Schema.JSON do
      config.validate_keys = true

      required(:id).filled(:int?)
      required(:membership_id).filled(:int?)
      required(:data).hash do
        optional(:users).filled(:array).each(:str?)
        optional(:results).filled(:array).each(:str?)
        optional(:assessors).filled(:array).each(:str?)
        optional(:campaigns).filled(:array).each(:str?)
        optional(:clients).filled(:array).each(:str?)
        optional(:projects).filled(:array).each(:str?)
        optional(:workshops).filled(:array).each(:str?)
        optional(:datasheets).filled(:array).each(:str?)
        optional(:sms_invites).filled(:array).each(:str?)
        optional(:communications).filled(:array).each(:str?)
        optional(:registration_codes).filled(:array).each(:str?)
      end
    end
  end
end
