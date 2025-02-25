# frozen_string_literal: true

module Administration
  module Projects
    class SamlSettingSerializer < Panko::Serializer
      include Rails.application.routes.url_helpers

      attributes :id, :enabled, :enforced, :entity_id, :sso_service_url, :cert, :after_signout_url,
                 :assertion_consumer_service_url, :issuer, :saml_signin_url, :name_identifier_format, :email_pipetext

      def assertion_consumer_service_url
        saml_user_session_url(url_options)
      end

      def issuer
        metadata_user_session_url(url_options)
      end

      def saml_signin_url
        return unless context[:requires_verification]

        new_saml_user_session_url(
          url_options.merge(saml_setting_type: :test)
        )
      end

      def url_options
        {
          host: Settings.domain,
          subdomain: object.project.subdomain,
          protocol: Settings.protocol,
          port: Settings.port
        }
      end
    end
  end
end
