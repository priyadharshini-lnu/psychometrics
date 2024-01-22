# frozen_string_literal: true

module Api
  module V2
    module Factor
      class Schema < Api::Base::Schema
        def self.resource
          'factors'
        end

        def self.base_attributes(attribute)
          proc do
            attribute[:name].filled(:string)
          end
        end

        def self.meta?
          false
        end

        def self.links?
          false
        end
      end
    end
  end
end
