# frozen_string_literal: true

module Api
  module V2
    module MaintenanceSetting
      class Schema < Api::Base::Schema
        def self.resource
          'maintenance_settings'
        end

        def self.attributes(attribute, _)
          proc do
            attribute[:sub_system].filled(:string, included_in?: %w[proctoring])
            attribute[:maintenance_window_enabled].filled(:bool)
            attribute[:time_zone].filled(:string)
            attribute[:start_time].filled(:string)
            attribute[:end_time].filled(:string)
          end
        end

        def self.relationships(_)
          []
        end
      end
    end
  end
end
