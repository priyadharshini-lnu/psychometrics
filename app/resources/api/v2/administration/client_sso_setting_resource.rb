# frozen_string_literal: true

class Api::V2::Administration::ClientSsoSettingResource < Api::V2::Administration::BaseResource
  include Rails.application.routes.url_helpers

  attributes :sso_enabled, :sso_enforced, :enforce_for, :enforced_domains,
             :idp_entity_id, :idp_sso_url, :idp_slo_url, :idp_cert, :session_timeout,
             :allowed_domains, :assertion_consumer_service_url, :issuer

  ransack_filters %i[tenant_id_eq]

  def assertion_consumer_service_url
    @model.saml_consumer_url(url_options)
  end

  def issuer
    @model.saml_metadata_url(url_options)
  end

  private

  def url_options
    {
      host: AdminSubdomain.admin_host_for(@model.client),
      protocol: Settings.protocol,
      port: Settings.port
    }
  end
end
