# frozen_string_literal: true

module Api
  module V2
    module Administration
      class AI::AssistantResource < BaseResource
        model_name 'AI::Assistant'
        attributes :name, :description, :assistant_type, :user_prompt, :system_prompt,
                   :created_at, :updated_at, :model_id, :status, :dependencies,
                   :assistant_output_schema_keys_attributes, :model_params,
                   :advanced_prompting_enabled, :in_use, :provider_previously_used

        has_one :owner, class_name: 'Client'
        has_one :last_modified_by, class_name: 'User'
        has_many :assistant_output_schema_keys, class_name: 'AssistantOutputSchemaKey'

        ransack_filters %i[filterable_fields assistant_type_eq assistant_type_in model_id_eq model_id_in]

        before_save do
          @model.last_modified_by_id = context[:user].id
        end

        delegate :assistant_output_schema_keys_attributes=, to: :@model

        def in_use
          @model.in_use?
        end

        def provider_previously_used
          @model.provider_previously_used?
        end

        def assistant_output_schema_keys_attributes
          @model.assistant_output_schema_keys.map do |schema_key|
            {
              id: schema_key.id,
              key: schema_key.key,
              key_type: schema_key.key_type,
              description: schema_key.description
            }
          end
        end

        def self.creatable_fields(context)
          super - %i[owner last_modified_by created_at updated_at]
        end

        def self.updatable_fields(context)
          super - %i[owner last_modified_by created_at updated_at]
        end
      end
    end
  end
end
