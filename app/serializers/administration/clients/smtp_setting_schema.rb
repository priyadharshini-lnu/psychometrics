# frozen_string_literal: true

module Administration
  module Clients
    class SmtpSettingSchema < BaseSchema
      def self.schema(_, _)
        Dry::Schema.JSON do
          config.validate_keys = true

          required(:id).filled(:int?)
          required(:from_name).maybe(:str?)
          required(:from_email).maybe(:str?)
          required(:host).maybe(:str?)
          required(:encryption).filled(:str?)
          required(:port).maybe(:int?)
          required(:user_name).maybe(:str?)
          required(:authentication_type).maybe(:str?)
          required(:enabled).filled(:bool?)
          required(:use_sender_verification).filled(:bool?)
        end
      end
    end
  end
end
