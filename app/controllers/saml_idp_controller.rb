# frozen_string_literal: true

class SamlIdpController < ApplicationController
  include SamlIdp::Controller

  layout 'end_user', only: %i[new create]

  skip_before_action :verify_authenticity_token
  before_action :authenticate_user!, except: [:show]

  def show
    sp = SamlServiceProvider.find_by(id: params[:id], project: @current_project, enabled: true)
    return render plain: 'Service provider not found', status: :not_found unless sp

    ::SamlIdp::GenerateProjectMetadata.call(project: @current_project, service_provider: sp,
                                            request: request) do
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
      audit_saml_request_authenticated
      create_saml_response
    else
      audit_saml_request_unauthenticated
      store_saml_params_in_session
      redirect_to new_user_session_path
    end
  end

  def create
    return handle_invalid_request unless validate_saml_request

    if user_signed_in?
      audit_saml_response_generated
      create_saml_response
    else
      audit_saml_authentication_failed
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
    audit_saml_invalid_request
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
    @service_provider ||= if params[:id].present?
                            SamlServiceProvider.find_by(id: params[:id], project: @current_project, enabled: true)
                          else
                            SamlServiceProvider.find_by(entity_id: saml_request.issuer, enabled: true)
                          end
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

  def audit_saml_request_authenticated
    AuditLogModule.audit!(:saml_idp_request_authenticated, current_user,
                          project: @current_project,
                          payload: build_saml_audit_payload)
  end

  def audit_saml_request_unauthenticated
    AuditLogModule.audit!(:saml_idp_request_unauthenticated, nil,
                          project: @current_project,
                          payload: build_saml_audit_payload)
  end

  def audit_saml_response_generated
    AuditLogModule.audit!(:saml_idp_response_generated, current_user,
                          project: @current_project,
                          payload: build_saml_audit_payload)
  end

  def audit_saml_authentication_failed
    AuditLogModule.audit!(:saml_idp_authentication_failed, nil,
                          project: @current_project,
                          payload: build_saml_audit_payload)
  end

  def audit_saml_invalid_request
    AuditLogModule.audit!(:saml_idp_invalid_request, nil,
                          project: @current_project,
                          payload: build_saml_audit_payload)
  end

  def build_saml_audit_payload
    {
      service_provider_entity_id: service_provider&.entity_id,
      relay_state: params[:RelayState] || session[:relay_state],
      user_agent: request.user_agent,
      remote_ip: request.remote_ip,
      referer: request.referer,
      saml_request_present: request_param.present?,
      saml_request_valid: saml_request&.valid?
    }
  end
end
