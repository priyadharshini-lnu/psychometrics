# frozen_string_literal: true

class Api::V2::ClientSsoSettings::Schema < Api::Base::Schema
  def self.resource
    'client_sso_settings'
  end

  def self.attributes(attribute, _)
    proc do
      attribute[:sso_enabled].filled(:bool)
      attribute[:sso_enforced].filled(:bool)
      attribute[:enforce_for].filled(:string)
      attribute[:enforced_domains].array(:string)
      attribute[:idp_entity_id].maybe(:string)
      attribute[:idp_sso_url].maybe(:string)
      attribute[:idp_slo_url].maybe(:string)
      attribute[:idp_cert].maybe(:string)
      attribute[:session_timeout].maybe(:integer)
      attribute[:allowed_domains].array(:string)
    end
  end
end
