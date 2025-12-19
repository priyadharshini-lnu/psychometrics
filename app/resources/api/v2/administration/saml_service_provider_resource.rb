# frozen_string_literal: true

class Api::V2::Administration::SamlServiceProviderResource < Api::V2::Administration::BaseResource
  attributes :created_at, :updated_at, :enabled, :project_id, :name, :entity_id, :acs_urls, :idp_certificate,
             :sso_service_url, :issuer_uri, :mask_identity, :integration_type

  ransack_filters %i[filterable_fields enabled_true]

  audit_log_for :create, payload: '*'
  audit_log_for :update, payload: '*'
  audit_log_for :destroy, payload: ->(_, saml_service_provider) { saml_service_provider.slice('id', 'name') }
  audit_log_for :rotate_certificate, payload: ->(_, saml_service_provider) { saml_service_provider.slice('id', 'name') }

  def updated_at
    I18n.l @model.updated_at, format: :short
  end

  def fetchable_fields
    super - %i[password api_key]
  end

  def self.records(opts = {})
    ::Pundit.policy_scope!(
      opts[:context][:user], [:api, :administration, SamlServiceProvider]
    ).saml_service_providers_of(opts[:context][:project_id])
  end

  before_create do
    @model.project_id = context[:project_id]
  end
end
