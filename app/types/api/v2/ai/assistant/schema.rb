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
              attribute[:description].maybe(:string)
              attribute[:system_prompt].maybe(:string)
              attribute[:user_prompt].maybe(:string)
              attribute[:assistant_type].maybe(:string)
              attribute[:created_at].filled(:string)
              attribute[:updated_at].filled(:string)
              attribute[:model_id].maybe(:string)
              attribute[:status].maybe(:string)
              attribute[:dependencies].maybe(:array).each(:string)
              attribute[:model_params].maybe
            end
          end

          def self.create_request
            json_api_attributes do
              required(:name).filled(:string)
              required(:description).filled(:string)
              required(:system_prompt).filled(:string)
              optional(:user_prompt).filled(:string)
              required(:assistant_type).filled(:string)
              required(:model_id).filled(:string)
              optional(:status).maybe(:string)
              optional(:dependencies).maybe(:array).each(:string)
              optional(:model_params).hash do
                optional(:max_tokens).maybe(:integer)
                optional(:temperature).maybe { int? | float? }
                optional(:thinking_effort).maybe(:string)
                optional(:thinking_budget).maybe(:integer)
              end
            end
          end

          def self.update_request
            json_api_attributes do
              optional(:name).filled(:string)
              optional(:description).maybe(:string)
              optional(:system_prompt).maybe(:string)
              optional(:user_prompt).maybe(:string)
              optional(:assistant_type).maybe(:string)
              optional(:model_id).filled(:string)
              optional(:status).maybe(:string)
              optional(:dependencies).maybe(:array).each(:string)
              optional(:model_params).hash do
                optional(:max_tokens).maybe(:integer)
                optional(:temperature).maybe { int? | float? }
                optional(:thinking_effort).maybe(:string)
                optional(:thinking_budget).maybe(:integer)
              end
            end
          end

          def self.generate_request
            # No parameters needed for generate
            Dry::Schema.JSON do
              # This action doesn't require any input validation
            end
          end

          def self.relationships(_)
            [
              { name: :owner, resource: :clients, relationship: :one, required: false, allowed_blank: true },
              { name: :last_modified_by, resource: :users, relationship: :one, required: false, allowed_blank: true },
              { name: :assistant_output_schema_keys, resource: :assistant_output_schema_keys, relationship: :many,
                required: false, allowed_blank: true }
            ]
          end
        end
      end
    end
  end
end
