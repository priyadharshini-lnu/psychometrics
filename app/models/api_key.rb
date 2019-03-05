# frozen_string_literal: true

class ApiKey < ApplicationRecord
  belongs_to :user, class_name: 'User', inverse_of: :api_keys

  scope :active, -> { where.not(disabled: true) }

  validates :token, :key, presence: true

  attr_encrypted :token, key: Base64.decode64(Rails.application.secrets.encrypted_key.to_s)
end
