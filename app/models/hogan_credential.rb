# frozen_string_literal: true

class HoganCredential < ApplicationRecord
  audited except: %i[encrypted_password encrypted_password_iv]

  belongs_to :membership
  belongs_to :user

  validates :encrypted_password, presence: true
  validates :participant_id, presence: true

  attr_encrypted :password, key: Base64.decode64(Rails.application.secrets.hogan[:encrypted_key])

  enum provider: { phoenix: 0, mentis: 1 }
end
