# frozen_string_literal: true

module Api
  module V2
    module Administration
      class AI::VoiceCharacterResource < BaseResource
        model_name 'AI::VoiceCharacter'
        attributes :name, :provider, :external_voice_id, :locale, :style, :rate, :pitch,
                   :created_at, :updated_at

        has_one :tenant, class_name: 'Client'
        has_one :last_modified_by, class_name: 'User'

        ransack_filters %i[filterable_fields provider_eq provider_in locale_eq locale_in]

        before_save do
          @model.last_modified_by_id = context[:user].id
        end

        def self.creatable_fields(context)
          super - %i[last_modified_by created_at updated_at]
        end

        def self.updatable_fields(context)
          super - %i[last_modified_by created_at updated_at]
        end
      end
    end
  end
end
