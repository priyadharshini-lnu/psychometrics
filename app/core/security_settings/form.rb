# frozen_string_literal: true

module SecuritySettings
  class Form < Rectify::Form
    mimic :security_setting_forms

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
    attribute :magic_link_expiry_in_seconds, Integer
    attribute :magic_link_enabled, Boolean
    attribute :disallow_password_login, Boolean
    attribute :session_inactivity_timeout_in_seconds, Integer

    validates :min_password_length, numericality: { greater_than_or_equal_to: 8, less_than_or_equal_to: 128 }
    validates :magic_link_expiry_in_seconds, presence: true
    validates :magic_link_expiry_in_seconds, numericality: { greater_than_or_equal_to: 5.minutes.to_i }
    validates :session_inactivity_timeout_in_seconds, presence: true
    validates :session_inactivity_timeout_in_seconds, numericality: { greater_than_or_equal_to: 60.minutes.to_i }
  end
end
