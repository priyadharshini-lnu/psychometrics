# frozen_string_literal: true

class ClientAuditlogExportSetting < ApplicationRecord
  belongs_to :client
  include ApplicationConfigurationLoggable

  include Tenantable

  enum :destination_type, { s3: 0, s3_compatible: 1 }

  attr_encrypted :s3_secret_access_key, key: Base64.decode64(Settings.secrets.encrypted_key.to_s)

  scope :active, -> { where(active: true) }
end
