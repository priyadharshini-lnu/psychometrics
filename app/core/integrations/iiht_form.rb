# frozen_string_literal: true

module Integrations
  class IihtForm < Integrations::BaseForm
    attribute :tenant_id, String
    attribute :tenancy_name, String
    attribute :user, String
    attribute :password, String

    validates :tenant_id, :tenancy_name, :user, presence: true
    validate :password_present_on_create
    validate :unique_tenant_id
    validate :unique_tenancy_name

    def unique_tenant_id
      scope = Integration.iiht
      scope = scope.where.not(id: context.integration.id) if context.integration
      if scope.exists?(["config ->> 'tenant_id' = ?", tenant_id])
        errors.add(:base, I18n.t('administration.integrations.validations.iiht.tenant_id_present'))
      end
    end

    def unique_tenancy_name
      scope = Integration.iiht
      scope = scope.where.not(id: context.integration.id) if context.integration
      if scope.exists?(["config ->> 'tenancy_name' = ?", tenancy_name])
        errors.add(:base, I18n.t('administration.integrations.validations.iiht.tenancy_name_present'))
      end
    end

    def password
      new_password = super
      return Base64.encode64(Encryptor.encrypt(new_password)) if new_password.present?

      context.integration ? context.integration.config['password'] : nil
    end

    private

    def password_present_on_create
      return if context.integration.present?
      return if password.present?

      errors.add(:password, :blank)
    end
  end
end
