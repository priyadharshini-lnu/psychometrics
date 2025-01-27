# frozen_string_literal: true

module Api
  module V2
    module IdpTemplate
      class Schema < Api::Base::Schema
        def self.resource
          'idp_template'
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
            attribute[:skills].array(:integer)
          end
        end

        def self.relationships(_)
          [
            { name: :project, resource: :clients, relationship: :one },
            { name: :report, resource: :reports, relationship: :one }
          ]
        end

        def self.links?
          false
        end
      end
    end
  end
end
