# frozen_string_literal: true

module Integrations
  class SkillvueForm < Integrations::BaseForm
    attribute :api_key, String
    attribute :name, String

    validates :api_key, :name, presence: true
    validate :unique_api_key

    def unique_api_key
      existing_integration = Integration.skillvue.where.not(id: id).exists?(["config ->> 'api_key' = ?", api_key])
      if existing_integration
        errors.add(:base, I18n.t('administration.integrations.validations.skillvue.api_key_present'))
      end
    end

    def api_key
      new_api_key = super
      Base64.encode64(Encryptor.encrypt(new_api_key)) if new_api_key.present?
    end
  end
end
