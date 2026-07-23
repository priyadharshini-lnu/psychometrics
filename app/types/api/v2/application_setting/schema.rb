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
            optional(:ip_whitelisting_enabled).maybe(:bool)
            optional(:url_whitelisting_enabled).maybe(:bool)
          end
        end
      end
    end
  end
end
