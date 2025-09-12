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
            optional(:status).maybe(:string)
          end
        end

        def self.update_reflection_questions_request
          json_api_attributes do
            required(:reflection_questions).array(:hash) do
              required(:id).filled(:string)
              required(:mandatory).filled(:bool)
              optional(:min_words).maybe(:integer)
              optional(:max_words).maybe(:integer)
              optional(:translations).hash do
                optional(:title_text).maybe(:string)
                optional(:subtitle_text).maybe(:string)
              end
            end
          end
        end

        def self.update_interview_questions_request
          json_api_attributes do
            required(:interview_questions).array(:hash) do
              required(:id).filled(:string)
              required(:order).filled(:integer)
              required(:mandatory).filled(:bool)
              optional(:time_limit).maybe(:integer)
            end
          end
        end

        def self.update_instructions_request
          json_api_attributes do
            required(:instructions).filled(:hash)
            required(:locale).filled(:string)
          end
        end

        def self.create_request
          json_api_attributes do
            required(:name).filled(:string)
            required(:description).filled(:string)
            optional(:self_rating_enabled).maybe(:bool)
          end
        end

        def self.relationships(_)
          [
            { name: :skills, resource: :skills, relationship: :many, required: false, allowed_blank: true },
            { name: :project, resource: :clients, relationship: :one, required: false },
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
