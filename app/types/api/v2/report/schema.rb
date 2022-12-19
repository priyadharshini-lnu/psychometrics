# frozen_string_literal: true

module Api
  module V2
    module Report
      class Schema < Api::Base::Schema
        def self.resource
          'reports'
        end

        def self.attributes(attribute, _)
          proc do
            attribute[:name].filled(:string)
          end
        end
      end
    end
  end
end
