# frozen_string_literal: true

class ApplicationPublicKey < ApplicationRecord
  audited except: %i[public_key fingerprint]

  MIN_KEY_ID = 10**17
  MAX_KEY_ID = (10**18) - 1

  belongs_to :user, class_name: 'Users::Application'
  belongs_to :application, class_name: 'Users::Application', foreign_key: :user_id, optional: true
  belongs_to :creator, foreign_key: :created_by_id, class_name: 'User', optional: true

  include Tenantable

  tenant_source :application

  scope :active, -> { where(disabled: false) }
  scope :inactive, -> { where(disabled: true) }

  validates :public_key, presence: true
  validates :key_id, presence: true, uniqueness: true, numericality: { only_integer: true }
  validate :validate_rsa_public_key, on: :create
  validate :public_key_immutable, on: :update

  before_validation :assign_key_id, on: :create
  before_validation :assign_fingerprint, on: :create

  def activate!
    update!(disabled: false)
  end

  def deactivate!
    update!(disabled: true)
  end

  def openssl_key
    OpenSSL::PKey::RSA.new(public_key)
  rescue OpenSSL::PKey::PKeyError
    nil
  end

  private

  def assign_key_id
    self.key_id ||= loop do
      candidate = SecureRandom.random_number(MIN_KEY_ID..MAX_KEY_ID)
      break candidate unless ApplicationPublicKey.exists?(key_id: candidate)
    end
  end

  def assign_fingerprint
    return if public_key.blank?

    key = openssl_key
    return unless key

    digest = OpenSSL::Digest::SHA256.digest(key.public_key.to_der)
    self.fingerprint = "SHA256:#{Base64.strict_encode64(digest).chomp('=')}"
  end

  def validate_rsa_public_key
    return if public_key.blank?

    key = openssl_key
    if key.nil?
      errors.add(:public_key, I18n.t('admin.public_key_invalid_format'))
    elsif key.private?
      errors.add(:public_key, I18n.t('admin.public_key_must_be_public'))
    end
  end

  def public_key_immutable
    errors.add(:public_key, I18n.t('admin.public_key_cannot_be_changed')) if will_save_change_to_public_key?
  end
end
