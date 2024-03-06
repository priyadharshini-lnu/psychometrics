# frozen_string_literal: true

class MembershipGrantsSchema < BaseSchema
  def self.schema(_, _)
    Dry::Schema.JSON do
      config.validate_keys = true

      required(:id).filled(:int?)
      required(:membership_id).filled(:int?)
      required(:data).hash do
        optional(:users).maybe(:array).each(:str?)
        optional(:results).maybe(:array).each(:str?)
        optional(:assessors).maybe(:array).each(:str?)
        optional(:campaigns).maybe(:array).each(:str?)
        optional(:campaign_factors).maybe(:array).each(:str?)
        optional(:clients).maybe(:array).each(:str?)
        optional(:projects).maybe(:array).each(:str?)
        optional(:workshops).maybe(:array).each(:str?)
        optional(:datasheets).maybe(:array).each(:str?)
        optional(:sms_invites).maybe(:array).each(:str?)
        optional(:communications).maybe(:array).each(:str?)
        optional(:registration_codes).maybe(:array).each(:str?)
      end
    end
  end
end
