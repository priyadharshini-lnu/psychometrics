# frozen_string_literal: true

module Api
  module V2
    module Administration
      class AI::AssistantResource < BaseResource
        model_name 'AI::Assistant'
        attributes :name, :description, :action, :user_prompt, :system_prompt, :created_at, :updated_at

        has_one :owner, class_name: 'Client', resource: 'Api::V2::Administration::ClientResource'
        has_one :last_modified_by, class_name: 'User', resource: 'Api::V2::Administration::UserResource'

        before_save do
          @model.last_modified_by_id = context[:user].id
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
