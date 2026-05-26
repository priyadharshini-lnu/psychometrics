# frozen_string_literal: true

module AttachmentAIAssistanceExtensions
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
  ActiveSupport.on_load(:active_storage_attachment) do
    include AttachmentAIAssistanceExtensions
    include Tenantable

    tenant_source :record
  end
end
