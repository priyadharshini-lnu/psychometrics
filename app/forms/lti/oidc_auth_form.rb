# frozen_string_literal: true

module Lti
  class OidcAuthForm < BaseForm
    ALLOWED_URI_SCHEMES = %w[http https].freeze

    attr_accessor :response_type, :scope, :login_hint, :lti_message_hint,
                  :state, :redirect_uri, :client_id, :lti_deployment_id, :nonce

    validates :response_type,
              presence: { message: I18n.t('lti.oidc_auth_form.errors.response_type.blank') },
              inclusion: {
                in: ['id_token'],
                message: I18n.t('lti.oidc_auth_form.errors.response_type.invalid')
              }

    validates :scope,
              presence: { message: I18n.t('lti.oidc_auth_form.errors.scope.blank') },
              inclusion: {
                in: ['openid'],
                message: I18n.t('lti.oidc_auth_form.errors.scope.invalid')
              }

    validates :login_hint,
              presence: { message: I18n.t('lti.oidc_auth_form.errors.login_hint.blank') }

    validates :client_id,
              presence: { message: I18n.t('lti.oidc_auth_form.errors.client_id.blank') }

    validates :nonce,
              presence: { message: I18n.t('lti.oidc_auth_form.errors.nonce.blank') }

    validates :redirect_uri,
              presence: { message: I18n.t('lti.oidc_auth_form.errors.redirect_uri.blank') }

    validate :validate_login_hint_user_assessment
    validate :validate_client_id_matches_project
    validate :validate_redirect_uri_format
    validate :validate_redirect_uri_scheme
    validate :validate_deployment_id_exists

    def initialize(params = {})
      @response_type = params[:response_type]
      @scope = params[:scope]
      @login_hint = params[:login_hint]
      @lti_message_hint = params[:lti_message_hint]
      @state = params[:state]
      @redirect_uri = params[:redirect_uri]
      @client_id = params[:client_id]
      @lti_deployment_id = params[:lti_deployment_id]
      @nonce = params[:nonce]
    end

    private

    def validate_login_hint_user_assessment
      return if login_hint.blank?

      unless user_assessment
        errors.add(:login_hint, I18n.t('lti.oidc_auth_form.errors.login_hint.invalid_user_assessment'))
        return
      end

      if user_assessment.completed?
        errors.add(:login_hint, I18n.t('lti.oidc_auth_form.errors.login_hint.assessment_completed'))
      end
    end

    def validate_client_id_matches_project
      return if client_id.blank?

      unless client_id == project&.id&.to_s
        errors.add(:client_id, I18n.t('lti.oidc_auth_form.errors.client_id.invalid'))
      end
    rescue StandardError => e
      Rails.logger.error "Client ID validation error: #{e.message}"
      errors.add(:client_id, I18n.t('lti.oidc_auth_form.errors.client_id.validation_failed'))
    end

    def validate_redirect_uri_format
      return if redirect_uri.blank?

      uri = URI.parse(redirect_uri)

      unless uri.host
        errors.add(:redirect_uri, I18n.t('lti.oidc_auth_form.errors.redirect_uri.missing_host'))
        return
      end

      if uri.fragment
        errors.add(:redirect_uri, I18n.t('lti.oidc_auth_form.errors.redirect_uri.has_fragment'))
      end
    rescue URI::InvalidURIError
      errors.add(:redirect_uri, I18n.t('lti.oidc_auth_form.errors.redirect_uri.invalid_format'))
    end

    def validate_redirect_uri_scheme
      return if redirect_uri.blank?
      return if errors.key?(:redirect_uri)

      begin
        uri = URI.parse(redirect_uri)

        unless ALLOWED_URI_SCHEMES.include?(uri.scheme)
          errors.add(:redirect_uri, I18n.t('lti.oidc_auth_form.errors.redirect_uri.scheme_not_allowed'))
          return
        end

        if Rails.env.production? && uri.scheme == 'http'
          errors.add(:redirect_uri, I18n.t('lti.oidc_auth_form.errors.redirect_uri.https_required'))
        end
      rescue URI::InvalidURIError
        # Already handled in validate_redirect_uri_format
      end
    end

    def validate_deployment_id_exists
      return if lti_deployment_id.blank?

      unless integration_exists?
        errors.add(:lti_deployment_id, I18n.t('lti.oidc_auth_form.errors.lti_deployment_id.not_found'))
      end
    end

    def integration_exists?
      Integration.active.exists?(id: lti_deployment_id)
    end

    def user_assessment
      @user_assessment ||= UserAssessment.find_by_encoded_id(login_hint) if login_hint # rubocop:disable Rails/DynamicFindBy
    end

    def project
      @project ||= user_assessment&.project
    end
  end
end
