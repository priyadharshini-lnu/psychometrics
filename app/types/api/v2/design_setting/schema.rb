# frozen_string_literal: true

module Api
  module V2
    module DesignSetting
      class Schema < Api::Base::Schema
        def self.resource
          'design_settings'
        end

        def self.attributes(attribute, _)
          proc do
            optional(:background_color).maybe(:string)
            optional(:error_color).maybe(:string)
            optional(:info_color).maybe(:string)
            optional(:login_box_position).maybe(:string)
            optional(:primary_color).maybe(:string)
            optional(:success_color).maybe(:string)
            optional(:warning_color).maybe(:string)
            attribute[:background_size].filled(:string)
          end
        end

        def self.relationships(_)
          [
            { name: :project, resource: :projects, relationship: :one }
          ]
        end
      end
    end
  end
end
