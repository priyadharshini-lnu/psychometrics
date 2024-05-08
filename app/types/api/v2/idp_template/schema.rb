# frozen_string_literal: true

module Api
  module V2
    module IdpTemplate
      class Schema < Api::Base::Schema
        def self.resource
          'idp_template'
        end

        def self.attributes(attribute, _)
          proc do
            attribute[:name].filled(:string)
            attribute[:description].filled(:string)
          end
        end
      end
    end
  end
end
