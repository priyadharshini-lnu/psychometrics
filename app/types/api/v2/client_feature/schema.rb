# frozen_string_literal: true

module Api
  module V2
    module ClientFeature
      class Schema < Api::Base::Schema
        def self.resource
          'client_features'
        end

        def self.attributes(attribute, _type)
          proc do
            attribute[:sms_notification].maybe(:bool)
          end
        end
      end
    end
  end
end
