# frozen_string_literal: true

module Api
  module V2
    module WorkshopInvite
      class Schema < Api::Base::Schema
        def self.resource
          'workshop_invites'
        end

        def self.attributes(attribute, _)
          proc do
            attribute[:allowed_languages].array(:string)
            attribute[:allow_language_preference].filled(:bool)
            attribute[:allow_neurodiversity_option].filled(:bool)
            optional(:workshop_ids).array(:string)
          end
        end

        def self.relationships(_type)
          [{
            name: :workshops, resource: :workshops, relationship: :many
          }]
        end
      end
    end
  end
end
