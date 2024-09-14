# frozen_string_literal: true

class HoganCredential < ApplicationRecord
  audited except: %i[encrypted_password encrypted_password_iv]

  belongs_to :membership
  belongs_to :user
  has_many :hogan_logs, foreign_key: :participant_id, primary_key: :participant_id

  validates :encrypted_password, presence: true
  validates :participant_id, presence: true

  attr_encrypted :password, key: Base64.decode64(Settings.secrets.hogan[:encrypted_key])

  enum provider: { phoenix: 0, mentis: 1, mercer: 2 }
end
