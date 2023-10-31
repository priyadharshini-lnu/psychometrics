# frozen_string_literal: true

class ActiveRecordAuditSerializer < ActiveModel::Serializer
  attributes :id, :auditable_type, :auditable_id, :action, :audited_changes

  KEYS_TO_EXCLUDE = %w[password encrypted_password encrypted_password_iv pdf_password
                       encrypted_pdf_password_iv encrypted_pdf_password].freeze

  def exclude_keys_from_hash(changes)
    case changes
      when Hash
        changes.except(*KEYS_TO_EXCLUDE).transform_values { |value| exclude_keys_from_hash(value) }
      when Array
        changes.map { |item| exclude_keys_from_hash(item) }
      else
        changes
    end
  end

  def audited_changes
    exclude_keys_from_hash(object.audited_changes)
  end
end
