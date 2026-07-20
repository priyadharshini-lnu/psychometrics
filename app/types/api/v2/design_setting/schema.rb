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
            optional(:logo_alt_text).
              filled(:string, max_size?: ::DesignSetting::MAX_ALT_TEXT_LENGTH,
              format?: ::DesignSetting::ALLOWED_CHARACTERS_REGEX)
            optional(:secondary_logo_alt_text).
              filled(:string, max_size?: ::DesignSetting::MAX_ALT_TEXT_LENGTH,
              format?: ::DesignSetting::ALLOWED_CHARACTERS_REGEX)
          end
        end

        def self.relationships(_)
          [
            { name: :project, resource: :projects, relationship: :one, required: false, allowed_blank: true },
            { name: :client, resource: :clients, relationship: :one, required: false, allowed_blank: true }
          ]
        end
      end
    end
  end
end
