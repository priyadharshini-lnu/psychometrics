# frozen_string_literal: true

module Api
  module V2
    module WorkshopFacilitator
      class Schema < Api::Base::Schema
        def self.resource
          'workshop_facilitators'
        end

        def self.attributes(attribute, _type)
          proc do
            attribute[:email].filled(:string)
            attribute[:name].filled(:string)
            attribute[:photo_url].maybe(:string)
          end
        end

        def self.links?
          false
        end
      end
    end
  end
end
