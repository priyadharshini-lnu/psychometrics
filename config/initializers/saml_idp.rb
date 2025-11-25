# frozen_string_literal: true

SamlIdp.configure do |config| # rubocop:disable Metrics/BlockLength
  # Certificate and key are dynamically loaded per service provider
  config.x509_certificate = lambda {
    current_sp = Current.saml_service_provider
    current_sp&.idp_certificate
  }

  config.secret_key = lambda {
    current_sp = Current.saml_service_provider
    current_sp&.idp_private_key
  }

  # Name ID formats
  config.name_id.formats = {
    email_address: ->(principal) { principal.email }
  }

  # Standard SAML attributes using URI-based names (compatible with Auth0, ADFS, etc.)
  config.attributes = {
    email: {
      name: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress',
      name_format: 'urn:oasis:names:tc:SAML:2.0:attrname-format:uri',
      friendly_name: 'Email Address',
      getter: ->(principal) { principal.email }
    },
    name: {
      name: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name',
      name_format: 'urn:oasis:names:tc:SAML:2.0:attrname-format:uri',
      friendly_name: 'Full Name',
      getter: ->(principal) { principal.name }
    },
    first_name: {
      name: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname',
      name_format: 'urn:oasis:names:tc:SAML:2.0:attrname-format:uri',
      friendly_name: 'First Name',
      getter: ->(principal) { principal.first_name }
    },
    last_name: {
      name: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname',
      name_format: 'urn:oasis:names:tc:SAML:2.0:attrname-format:uri',
      friendly_name: 'Last Name',
      getter: ->(principal) { principal.last_name }
    },

    email_basic: {
      name: 'email',
      name_format: 'urn:oasis:names:tc:SAML:2.0:attrname-format:basic',
      friendly_name: 'Email',
      getter: ->(principal) { principal.email }
    },
    name_basic: {
      name: 'name',
      name_format: 'urn:oasis:names:tc:SAML:2.0:attrname-format:basic',
      friendly_name: 'Name',
      getter: ->(principal) { principal.name }
    },
    groups: {
      name: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/groups',
      name_format: 'urn:oasis:names:tc:SAML:2.0:attrname-format:uri',
      friendly_name: 'Groups',
      getter: lambda { |principal|
        if principal.respond_to?(:groups) && principal.groups.present?
          principal.groups
        else
          []
        end
      }
    }
  }

  config.service_provider.finder = lambda do |issuer_or_entity_id|
    sp = SamlServiceProvider.find_by(entity_id: issuer_or_entity_id, project_id: Current.project&.id, enabled: true)

    if sp
      Current.saml_service_provider = sp
      {
        cert: sp.certificate,
        fingerprint: nil,
        response_hosts: sp.acs_urls.map { |url| URI.parse(url).host }.uniq
      }
    end
  end

  config.service_provider.metadata_persister = lambda do |_entity_id, _settings|
    true
  end
end
