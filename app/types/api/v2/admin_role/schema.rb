# frozen_string_literal: true

module Api
  module V2
    module AdminRole
      class Schema < Api::Base::Schema
        def self.resource
          'admin_roles'
        end

        def self.attributes(attribute, _)
          proc do
            attribute[:name].filled(:string)
            attribute[:description].filled(:string)
            attribute[:client_id].filled(:integer)
          end
        end
      end
    end
  end
end
