# frozen_string_literal: true

module SecuritySettings
  class Form < Rectify::Form
    attribute :enforce_strong_password, Boolean
    attribute :min_password_length, Integer
    attribute :enforce_password_policy, Boolean
    attribute :disable_password_reuse, Boolean
    attribute :password_expiration, String
    attribute :restrict_sequences, Boolean
    attribute :lock_account, Boolean
    attribute :attempts_to_lock, Integer
    attribute :auto_unlock_time, Integer
    attribute :send_unlock_email, Boolean
    attribute :tfa_enabled, Boolean

    validates :min_password_length, numericality: { greater_than_or_equal_to: 8, less_than_or_equal_to: 128 }
  end
end
