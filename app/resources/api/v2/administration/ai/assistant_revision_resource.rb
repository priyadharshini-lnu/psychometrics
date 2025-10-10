# frozen_string_literal: true

module Api
  module V2
    module Administration
      module AI
        class AssistantRevisionResource < ::Api::V2::Administration::BaseResource
          # Map to Audited::Audit records
          model_name 'Audited::Audit'

          # Force JSON:API type to be 'revisions'
          def self._type
            'assistant_revisions'
          end

          attributes :audit_id, :created_at, :changes, :user_id, :action, :version

          # Attribute values
          def audit_id
            @model.id
          end

          def created_at
            @model.created_at.iso8601
          end

          def changes
            @model.audited_changes
          end
        end
      end
    end
  end
end
