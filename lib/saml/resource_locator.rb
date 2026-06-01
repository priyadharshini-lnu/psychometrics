# frozen_string_literal: true

module Saml
  class ResourceLocator
    def self.call(model, decorated_saml_response, auth_value)
      new(model, decorated_saml_response, auth_value).call
    end

    def initialize(model, decorated_saml_response, auth_value)
      @model = model
      @decorated_saml_response = decorated_saml_response
      @auth_value = auth_value
    end

    def call
      if client_admin_saml_issuer?
        find_client_admin_user
      elsif admin_saml_issuer?
        find_admin_user_by_auth_value
      else
        find_user_by_subdomain
      end
    rescue ActiveRecord::RecordNotFound => e
      Rails.logger.error "Client not found for subdomain: #{subdomain} - #{e.message}"
      nil
    end

    private

    attr_reader :model, :decorated_saml_response

    def client_admin_saml_issuer?
      AdminSubdomain.client_admin?(subdomain)
    end

    def admin_saml_issuer?
      decorated_saml_response.raw_response.issuers.include?(Settings.saml.idp_entity_id)
    end

    def find_client_admin_user
      find_user_by_auth_value
    end

    def find_admin_user_by_auth_value
      find_user_by_auth_value
    end

    def find_user_by_auth_value
      model.find_by(Devise.saml_default_user_key => @auth_value)
    end

    def find_user_by_subdomain
      project = Client.find_by!(subdomain: subdomain)
      saml_setting = project.saml_setting

      if saml_setting.persistent_name_identifier?
        @auth_value = saml_setting.email_pipetext.gsub('{{identifier}}', @auth_value)
      end

      model.find_by(Devise.saml_default_user_key => @auth_value, project: project)
    end

    def subdomain
      @subdomain ||= URI.parse(decorated_saml_response.raw_response.destination).host.split('.').first
    end
  end
end
