# frozen_string_literal: true

module Api
  module V2
    module RegistrationSetting
      class Schema < Api::Base::Schema
        def self.resource
          'registration_settings'
        end

        def self.attributes(_attribute, _)
          proc do
            required(:require_mobile_number).maybe(:bool)
          end
        end
      end
    end
  end
end
