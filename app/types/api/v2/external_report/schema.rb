# frozen_string_literal: true

module Api
  module V2
    module ExternalReport
      class Schema < Api::Base::Schema
        def self.resource
          'external_reports'
        end

        def self.attributes(attribute, _)
          proc do
            attribute[:name].filled(:string)
          end
        end

        def self.links?
          false
        end

        def self.meta?
          false
        end
      end
    end
  end
end
