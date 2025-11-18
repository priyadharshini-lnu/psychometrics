# frozen_string_literal: true

module SamlIdp
  class GenerateProjectMetadata < BaseCommand
    attr_reader :project, :request

    def initialize(project:, request:)
      @project = project
      @request = request
    end

    def call
      service_provider = SamlServiceProvider.find_by(project: project, enabled: true)
      if service_provider
        Current.saml_service_provider = service_provider
      end

      return broadcast(:ok, nil) unless service_provider

      base_url = saml_idp_base_url

      default_config = ::SamlIdp.config.dup
      default_config.entity_id = "#{base_url}/metadata"
      default_config.single_service_post_location = "#{base_url}/auth"
      default_config.single_logout_service_post_location = "#{base_url}/logout"
      default_config.single_logout_service_redirect_location = "#{base_url}/logout"

      begin
        metadata = ::SamlIdp::MetadataBuilder.new(default_config).signed
        broadcast(:ok, metadata)
      rescue OpenSSL::PKey::RSAError => e
        Rails.logger.error "SAML IdP certificate error: #{e.message}"
        metadata = ::SamlIdp::MetadataBuilder.new(default_config).fresh
        broadcast(:ok, metadata)
      end
    end

    private

    def saml_idp_base_url
      "#{Utility::Url.generate(:root_url, subdomain: project.subdomain)}saml/idp"
    end
  end
end
