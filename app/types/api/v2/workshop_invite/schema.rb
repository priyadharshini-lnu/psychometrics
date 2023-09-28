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
          end
        end

        def self.create_request
          subject = Dry::Schema.define do
            required(:user_id).filled(:string)
          end

          translation = Dry::Schema.define do
            required(:locale).filled(:string)
            required(:title).filled(:string)
            required(:description).filled(:string)
          end

          json_api_attributes do
            optional(:allowed_languages).array(:string)
            required(:allow_language_preference).filled(:bool)
            required(:allow_neurodiversity_option).filled(:bool)
            optional(:workshop_ids).array(:string)
            optional(:subjects).array(subject)
            required(:translations).array(translation)
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
