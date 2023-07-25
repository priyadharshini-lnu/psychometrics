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
            # attribute[:workshop_id]
            attribute[:allowed_languages].array(:string)
            attribute[:allow_language_preference].filled(:bool)
            attribute[:allow_neurodiversity_option].filled(:bool)
          end
        end

        def self.relationships(_type)
          [{
            name: :workshop, resource: :workshops, relationship: :many
          }]
        end

        def self.create_subjects_and_translations
          subject_schema = Dry::Schema.define do
            required(:user_id).filled(:string)
          end
          translation_schema = Dry::Schema.define do
            required(:locale).filled(:string)
            required(:title).filled(:string)
            required(:description).filled(:string)
          end

          json_api_attributes do
            Dry::Schema.define do
              required(:subjects).array(subject_schema)
              required(:translations).array(translation_schema)
            end
          end
        end
      end
    end
  end
end
