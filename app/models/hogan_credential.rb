# frozen_string_literal: true

class HoganCredential < ApplicationRecord
  audited except: %i[encrypted_password encrypted_password_iv]

  DEFAULT_NORM = 'Global2023'

  belongs_to :membership
  belongs_to :user
  has_many :hogan_logs, foreign_key: :participant_id, primary_key: :participant_id

  include Tenantable

  tenant_source :user, :membership

  validates :encrypted_password, presence: true
  validates :participant_id, presence: true

  attr_encrypted :password, key: Base64.decode64(Settings.secrets.hogan[:encrypted_key])

  enum :provider, { phoenix: 0, mentis: 1, mercer: 2 }

  scope :active, -> { where(active: true) }

  after_commit :deactivate_other_credentials, on: :create, if: :active?

  private

  def deactivate_other_credentials
    HoganCredential.transaction do
      HoganCredential.where(user_id: user_id, active: true).where.not(id: id).update_all(active: false)
    end
  end
end
