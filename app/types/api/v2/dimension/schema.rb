# frozen_string_literal: true

module Api
  module V2
    module Dimension
      class Schema < Api::Base::Schema
        def self.resource
          'dimensions'
        end

        def self.attributes(attribute, _type)
          proc do
            attribute[:id].filled(:integer)
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
