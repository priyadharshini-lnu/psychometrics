# frozen_string_literal: true

module Api
  module V2
    module Application
      class Schema < Api::Base::Schema
        def self.resource
          'applications'
        end

        def self.links?
          false
        end

        def self.attributes(attribute, _type)
          proc do
            attribute[:name].filled(:string)
          end
        end
      end
    end
  end
end
