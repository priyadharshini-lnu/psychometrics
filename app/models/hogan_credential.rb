class HoganCredential < ApplicationRecord
  belongs_to :membership

  validates :encrypted_password, presence: true
  validates :participant_id, presence: true

  attr_encrypted :password, key: Base64.decode64(Rails.application.secrets.hogan[:encrypted_key])
end
