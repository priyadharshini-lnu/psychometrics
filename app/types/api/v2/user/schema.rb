# frozen_string_literal: true

module Api
  module V2
    module User
      class Schema < Api::Base::Schema
        def self.resource
          'users'
        end

        def self.attributes(attribute, _)
          proc do
            attribute[:name].filled(:string)
            attribute[:email].filled(:string)
          end
        end
      end
    end
  end
end
