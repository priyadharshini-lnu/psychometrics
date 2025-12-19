# frozen_string_literal: true

module SamlIdp
  class DeterminePrincipal < BaseCommand
    private_attr_reader :service_provider, :current_user, :request

    def initialize(service_provider:, current_user:, request:)
      @service_provider = service_provider
      @current_user = current_user
      @request = request
    end

    def call
      return broadcast(:error, 'Invalid parameters') unless valid_params?

      principal = if service_provider.integration_generic?
                    default_principal
                  else
                    integration_principals[service_provider.integration_type]&.call
                  end

      if principal
        broadcast(:ok, principal)
      else
        broadcast(:error, 'Unable to determine user principal for SAML authentication')
      end
    end

    private

    def integration_principals
      @integration_principals ||= {
        'yoodli' => -> { yoodli_principal }
      }
    end

    def valid_params?
      service_provider.present? && current_user.present? && request.present?
    end

    def yoodli_principal
      return nil unless user_assessment

      result = Yoodli::DeterminePrincipal.call(
        user_assessment: user_assessment
      )

      result[:ok]
    end

    def assessment_id_from_cookie
      request.cookies['saml_user_assessment_id']
    end

    def user_assessment
      @user_assessment ||= UserAssessment.find_by(id: assessment_id_from_cookie)
    end

    def default_principal
      if service_provider.mask_identity?
        current_user.maskable_identity(mask: service_provider.mask_identity)
      else
        current_user
      end
    end
  end
end
