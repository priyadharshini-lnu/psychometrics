# frozen_string_literal: true

module Api
  module V2
    module ApplicationSetting
      class Schema < Api::Base::Schema
        def self.resource
          'application_settings'
        end

        def self.attributes(_attribute, _type)
          proc do
            required(:ip_whitelisting_enabled).filled(:bool)
          end
        end
      end
    end
  end
end
