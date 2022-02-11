# frozen_string_literal: true

module Integrations
  class IihtForm < Integrations::BaseForm
    attribute :base_api_url, String
    attribute :company_id, String
    attribute :company_name, String
    attribute :user, String
    attribute :password, String

    validates :base_api_url, :company_id, :company_name, :user, presence: true
    validates :password, presence: true, if: -> { context.integration.nil? }
    validates :base_api_url, http_url: { presence: false }
    validate :unique_company

    def unique_company
      scope = Integration.iiht
      scope = scope.where.not(id: context.integration.id) if context.integration
      if scope.where("config ->> 'company_id' = ? AND config ->> 'company_name' = ?", company_id, company_name).exists?
        errors.add(:base, I18n.t('administration.integrations.validations.iiht.company_present'))
      end
    end

    def password
      new_password = super
      return Base64.encode64(Encryptor.encrypt(new_password)) if new_password.present?

      context.integration ? context.integration.config['password'] : nil
    end
  end
end
