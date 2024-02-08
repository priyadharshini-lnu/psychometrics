# frozen_string_literal: true

module Administration
  module Campaigns
    class SmsInvitesSearchSchema < BaseSchema
      def self.schema(_, _)
        Dry::Schema.JSON do
          config.validate_keys = true

          required(:id).filled(:int?)
          required(:full_name).filled(:str?)
        end
      end
    end
  end
end
