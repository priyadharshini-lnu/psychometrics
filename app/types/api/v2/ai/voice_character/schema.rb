# frozen_string_literal: true

module Api
  module V2
    module AI
      module VoiceCharacter
        class Schema < Api::Base::Schema
          def self.resource
            'voice_characters'
          end

          def self.attributes(attribute, _)
            proc do
              attribute[:name].filled(:string)
              attribute[:provider].maybe(:string)
              attribute[:external_voice_id].filled(:string)
              attribute[:locale].maybe(:string)
              attribute[:style].maybe(:string)
              attribute[:rate].maybe(:string)
              attribute[:pitch].maybe(:string)
              attribute[:created_at].filled(:string)
              attribute[:updated_at].filled(:string)
            end
          end

          def self.create_request
            json_api_attributes do
              required(:name).filled(:string)
              required(:external_voice_id).filled(:string)
              optional(:provider).filled(:string)
              optional(:locale).maybe(:string)
              optional(:style).maybe(:string)
              optional(:rate).maybe(:string)
              optional(:pitch).maybe(:string)
            end
          end

          def self.update_request
            json_api_attributes do
              optional(:name).filled(:string)
              optional(:external_voice_id).filled(:string)
              optional(:provider).filled(:string)
              optional(:locale).maybe(:string)
              optional(:style).maybe(:string)
              optional(:rate).maybe(:string)
              optional(:pitch).maybe(:string)
            end
          end

          def self.relationships(_)
            [
              { name: :tenant, resource: :clients, relationship: :one, required: false, allowed_blank: true },
              { name: :last_modified_by, resource: :users, relationship: :one, required: false, allowed_blank: true }
            ]
          end
        end
      end
    end
  end
end
