# frozen_string_literal: true

module BlobAIAssistanceExtensions
  extend ActiveSupport::Concern

  included do
    has_one :ai_assisted_user_document_summary,
            -> { where(type: 'AI::AssistedUserDocumentSummary') },
            as: :assistable,
            class_name: 'AI::AssistedUserDocumentSummary',
            dependent: :destroy
  end
end

Rails.application.config.to_prepare do
  unless ActiveStorage::Blob.included_modules.include?(BlobAIAssistanceExtensions)
    ActiveSupport.on_load(:active_storage_blob) do
      include BlobAIAssistanceExtensions
    end
  end
end
