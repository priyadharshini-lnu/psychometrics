# frozen_string_literal: true

class SamlIdpController < ApplicationController
  include SamlIdp::Controller

  layout 'end_user', only: %i[new create]

  skip_before_action :verify_authenticity_token
  before_action :authenticate_user!, except: [:show]

  def show
    ::SamlIdp::GenerateProjectMetadata.call(project: @current_project, request: request) do
      on(:ok) do |metadata|
        respond_to do |format|
          format.xml { render plain: metadata, content_type: 'application/xml' }
          format.html { render plain: metadata, content_type: 'text/xml' }
        end
      end
    end
  end

  def new
    return handle_invalid_request unless validate_saml_request

    if user_signed_in?
      create_saml_response
    else
      store_saml_params_in_session
      redirect_to new_user_session_path
    end
  end

  def create
    return handle_invalid_request unless validate_saml_request

    if user_signed_in?
      create_saml_response
    else
      handle_invalid_request
    end
  end

  private

  def store_saml_params_in_session
    session[:saml_request_param] = params[:SAMLRequest] if params[:SAMLRequest].present?
    session[:relay_state] = params[:RelayState] if params[:RelayState].present?
    session[:saml_signature] = params[:Signature] if params[:Signature].present?
    session[:saml_sig_alg] = params[:SigAlg] if params[:SigAlg].present?
  end

  def validate_saml_request
    request_param.present? && service_provider.present? && saml_request&.valid?
  end

  def handle_invalid_request
    respond_to do |format|
      format.html { render plain: 'Forbidden', status: :forbidden }
      format.xml { render plain: 'Forbidden', status: :forbidden }
      format.any { render plain: 'Forbidden', status: :forbidden }
    end
  end

  def create_saml_response
    principal = determine_user_principal
    @saml_response = encode_response(principal, { issuer_uri: service_provider.issuer_uri })
    @acs_url = saml_acs_url
    @relay_state = params[:RelayState] || session[:relay_state]

    render template: 'saml_idp/saml_post'
  rescue StandardError => e
    Rails.logger.error "SAML response generation failed: #{e.message}"
    render plain: I18n.t('shared.authentication_failed'), status: :internal_server_error
  end

  def service_provider
    @service_provider ||= SamlServiceProvider.find_by(entity_id: saml_request.issuer, enabled: true)
  end

  def request_param
    params[:SAMLRequest] || session[:saml_request_param]
  end

  def saml_request
    @saml_request ||= if request_param.present?
                        begin
                          decode_request(
                            request_param,
                            params[:Signature] || session[:saml_signature] || '',
                            params[:SigAlg] || session[:saml_sig_alg] || '',
                            params[:RelayState] || session[:relay_state] || ''
                          )
                        rescue StandardError => e
                          Rails.logger.error "Failed to decode SAML request: #{e.message}"
                          nil
                        end
                      end
  end

  def determine_user_principal
    result = SamlIdp::DeterminePrincipal.call(
      service_provider: service_provider,
      current_user: current_user,
      request: request
    )

    result[:ok] || raise(StandardError, "Authentication failed: #{result[:error]}")
  end

  def maskable_identity
    @maskable_identity ||= current_user.maskable_identity(
      mask: service_provider.mask_identity
    )
  end
end
