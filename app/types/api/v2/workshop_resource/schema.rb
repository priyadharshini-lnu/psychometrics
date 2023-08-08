# frozen_string_literal: true

module Api
  module V2
    module WorkshopResource
      class Schema < Api::Base::Schema
        def self.resource
          'workshop_resources'
        end

        def self.attributes(attribute, _)
          proc do
            attribute[:name].filled(:string)
            attribute[:url].filled(:string)
          end
        end
      end
    end
  end
end
