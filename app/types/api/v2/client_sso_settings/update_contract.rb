# frozen_string_literal: true

module Api
  module V2
    module ClientSsoSettings
      class UpdateContract < Api::Base::Contract
        config.messages.namespace = :client_sso_settings
        schema Api::V2::ClientSsoSettings::Schema.update_request

        rule(data: { attributes: :idp_entity_id }) do
          key.failure(:filled?) if values.dig(:data, :attributes, :sso_enabled) && value.blank?
        end

        rule(data: { attributes: :idp_sso_url }) do
          key.failure(:filled?) if values.dig(:data, :attributes, :sso_enabled) && value.blank?
        end

        rule(data: { attributes: :idp_cert }) do
          key.failure(:filled?) if values.dig(:data, :attributes, :sso_enabled) && value.blank?
        end

        rule(data: { attributes: :sso_enforced }) do
          key.failure(:sso_enforced_requires_enabled) if value && !values.dig(:data, :attributes, :sso_enabled)
        end

        rule(data: { attributes: :enforce_for }) do
          if key? && ClientSsoSetting.enforce_fors.keys.exclude?(value)
            key.failure("must be one of: #{ClientSsoSetting.enforce_fors.keys.join(', ')}")
          end
        end
      end
    end
  end
end
