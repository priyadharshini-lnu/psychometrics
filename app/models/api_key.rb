# frozen_string_literal: true

class ApiKey < ApplicationRecord
  audited except: %i[encrypted_token encrypted_token_iv key token]

  belongs_to :user, class_name: 'User', inverse_of: :api_keys
  belongs_to :creator, foreign_key: :created_by_id, class_name: 'User', optional: true
  belongs_to :modifier, foreign_key: :updated_by_id, class_name: 'User', optional: true
  belongs_to :application, class_name: 'Users::Application', foreign_key: :user_id, inverse_of: :api_keys

  include Tenantable

  tenant_source :application

  scope :active, -> { where.not(disabled: true) }

  validates :token, :key, presence: true

  attr_encrypted :token, key: Base64.decode64(Settings.secrets.encrypted_key.to_s)
end
