# frozen_string_literal: true

module Integrations
  class MettlForm < Integrations::BaseForm
    attribute :public_key, String
    attribute :private_key, String
    attribute :name, String

    validates :public_key, :private_key, :name, presence: true
    validate :unique_public_key

    def unique_public_key
      if Integration.mettl.exists?(["config ->> 'public_key' = ?", public_key])
        errors.add(:base, I18n.t('administration.integrations.validations.mettl.public_key_present'))
      end
    end

    def public_key
      new_public_key = super
      return Base64.encode64(Encryptor.encrypt(new_public_key)) if new_public_key.present?
    end

    def private_key
      new_private_key = super
      return Base64.encode64(Encryptor.encrypt(new_private_key)) if new_private_key.present?
    end
  end
end
