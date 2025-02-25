# frozen_string_literal: true

module Saml
  class ResourceLocator
    def self.call(model, decorated_saml_response, auth_value)
      acs_url = decorated_saml_response.raw_response.destination
      subdomain = URI.parse(acs_url).host.split('.').first
      project = Client.find_by!(subdomain: subdomain)
      saml_setting = project.saml_setting

      if saml_setting.persistent_name_identifier?
        auth_value = saml_setting.email_pipetext.gsub('{{identifier}}', auth_value)
      end

      model.find_by(Devise.saml_default_user_key => auth_value, project: project)
    end
  end
end
