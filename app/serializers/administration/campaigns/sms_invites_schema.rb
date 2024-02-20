# frozen_string_literal: true

module Administration
  module Campaigns
    class SmsInvitesSchema < BaseSchema
      def self.schema(_, _)
        Dry::Schema.JSON do
          config.validate_keys = true

          required(:id).filled(:int?)
          required(:first_name).filled(:str?)
          required(:last_name).filled(:str?)
          required(:email).maybe(:str?)
          required(:mobile_no).filled(:str?)
          required(:locale).filled(:str?)
          required(:status).filled(:str?)
          required(:created_at).filled(:str?)
          required(:created_by).filled(:str?)
        end
      end
    end
  end
end
