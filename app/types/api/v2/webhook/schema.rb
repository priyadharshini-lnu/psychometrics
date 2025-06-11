# frozen_string_literal: true

module Api
  module V2
    module Webhook
      class Schema < Api::Base::Schema
        def self.resource
          'webhooks'
        end

        def self.attributes(attribute, _)
          proc do
            optional(:username).maybe(:string)
            optional(:password).maybe(:string)
            attribute[:url].filled(:string)
            attribute[:description].filled(:string)
            optional(:topics).array(:str?)
            attribute[:auth_type].filled(:string)
            attribute[:active].filled(:bool)
            attribute[:rate_limit].filled(:integer)
            attribute[:rate_limit_period].filled(:integer)
          end
        end
      end
    end
  end
end
