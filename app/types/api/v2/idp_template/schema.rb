# frozen_string_literal: true

module Api
  module V2
    module IdpTemplate
      class Schema < Api::Base::Schema
        def self.resource
          'idp_templates'
        end

        def self.attributes(attribute, _)
          proc do
            attribute[:name].filled(:string)
            attribute[:description].filled(:string)
            attribute[:behavioural_global_tags].array(:string)
            attribute[:behavioural_client_tags].array(:string)
            attribute[:technical_global_tags].array(:string)
            attribute[:technical_client_tags].array(:string)
            attribute[:self_rating_enabled].filled(:bool)
            optional(:behavioral_global_skill_settings).maybe(:string)
            optional(:behavioral_client_skill_settings).maybe(:string)
            optional(:technical_global_skill_settings).maybe(:string)
            optional(:technical_client_skill_settings).maybe(:string)
          end
        end

        def self.relationships(_)
          [
            { name: :skills, resource: :skills, relationship: :many, required: false, allowed_blank: true },
            { name: :project, resource: :clients, relationship: :one, required: true },
            { name: :report, resource: :reports, relationship: :one, required: false, allowed_blank: true }
          ]
        end

        def self.links?
          false
        end
      end
    end
  end
end
