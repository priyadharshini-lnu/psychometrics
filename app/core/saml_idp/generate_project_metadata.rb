# frozen_string_literal: true

module SamlIdp
  class GenerateProjectMetadata < BaseCommand
    attr_reader :project, :service_provider, :request

    def initialize(project:, request:, service_provider:)
      @project = project
      @service_provider = service_provider
      @request = request
    end

    def call
      if service_provider
        Current.saml_service_provider = service_provider
      end

      return broadcast(:ok, nil) unless service_provider

      default_config = ::SamlIdp.config.dup
      default_config.entity_id = service_provider.issuer_uri
      default_config.single_service_post_location = service_provider.sso_service_url

      begin
        metadata = ::SamlIdp::MetadataBuilder.new(default_config).signed
        broadcast(:ok, metadata)
      rescue OpenSSL::PKey::RSAError => e
        Rails.logger.error "SAML IdP certificate error: #{e.message}"
        metadata = ::SamlIdp::MetadataBuilder.new(default_config).fresh
        broadcast(:ok, metadata)
      end
    end
  end
end
