# frozen_string_literal: true

module Api
  module V2
    module AI
      module Assistant
        class Schema < Api::Base::Schema
          def self.resource
            'assistants'
          end

          def self.attributes(attribute, _)
            proc do
              attribute[:name].filled(:string)
              attribute[:description].filled(:string)
              attribute[:system_prompt].filled(:string)
              attribute[:user_prompt].filled(:string)
              attribute[:action].filled(:string)
              attribute[:created_at].filled(:string)
              attribute[:updated_at].filled(:string)
            end
          end

          def self.relationships(_)
            [
              { name: :owner, resource: :clients, relationship: :one, required: false, allowed_blank: true },
              { name: :last_modified_by, resource: :users, relationship: :one, required: false, allowed_blank: true }
            ]
          end

          def self.create_request
            json_api_attributes do
              required(:name).filled(:string)
              required(:description).filled(:string)
              required(:system_prompt).filled(:string)
              required(:user_prompt).filled(:string)
              required(:action).filled(:string)
            end
          end

          def self.update_request
            json_api_attributes do
              optional(:name).filled(:string)
              optional(:description).filled(:string)
              optional(:system_prompt).filled(:string)
              optional(:user_prompt).filled(:string)
              optional(:action).filled(:string)
            end
          end
        end
      end
    end
  end
end
