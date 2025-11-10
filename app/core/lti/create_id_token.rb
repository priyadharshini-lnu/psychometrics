# frozen_string_literal: true

module Lti
  class CreateIdToken < BaseCommand
    include Rails.application.routes.url_helpers

    attr_reader :client_id, :redirect_uri, :login_hint, :lti_message_hint, :nonce, :integration

    def initialize(params)
      @client_id = params[:client_id]
      @redirect_uri = params[:redirect_uri]
      @login_hint = params[:login_hint]
      @lti_message_hint = params[:lti_message_hint]
      @nonce = params[:nonce]
      @integration = params[:integration]
    end

    def call
      id_token = build_id_token
      update_lti_user_assessment_from_config
      broadcast(:ok, id_token)
    rescue StandardError => e
      Rails.logger.error "ID Token Creation Error: #{e.message}"
      broadcast(:error, e.message)
    end

    private

    def build_id_token
      now = Time.current.to_i

      payload = {
        # LTI message type
        'https://purl.imsglobal.org/spec/lti/claim/message_type' => 'LtiResourceLinkRequest',

        # User roles
        'https://purl.imsglobal.org/spec/lti/claim/roles' => [
          'http://purl.imsglobal.org/vocab/lis/v2/membership#Learner',
          'http://purl.imsglobal.org/vocab/lis/v2/institution/person#Student'
        ],

        # Resource link
        'https://purl.imsglobal.org/spec/lti/claim/resource_link' => {
          id: lti_message_hint || user_assessment.encoded_id,
          title: assessment.name
        },

        # Context
        'https://purl.imsglobal.org/spec/lti/claim/context' => {
          id: assessment.external_assessment_id,
          type: ['http://purl.imsglobal.org/vocab/lis/v2/course#CourseOffering']
        },

        # Tool platform
        'https://purl.imsglobal.org/spec/lti/claim/tool_platform' => {
          name: source_app,
          guid: project.id.to_s
        },

        # LTI Advantage Services - Assignment and Grade Services
        'https://purl.imsglobal.org/spec/lti-ags/claim/endpoint' => {
          scope: [
            'https://purl.imsglobal.org/spec/lti-ags/scope/lineitem',
            'https://purl.imsglobal.org/spec/lti-ags/scope/result.readonly',
            'https://purl.imsglobal.org/spec/lti-ags/scope/score'
          ],
          lineitem: line_item_url
        },

        iss: platform_base_url,
        aud: client_id,
        iat: now,
        exp: session_inactivity_timeout.from_now.to_i,
        sub: login_hint,
        nonce: nonce,

        # LTI version
        'https://purl.imsglobal.org/spec/lti/claim/version' => '1.3.0',

        # User information claims (masked for privacy)
        name: maskable_identity.full_name,
        given_name: maskable_identity.first_name,
        family_name: maskable_identity.last_name,
        email: maskable_identity.email,

        # Locale
        locale: subject.locale || 'en',

        # Launch presentation
        'https://purl.imsglobal.org/spec/lti/claim/launch_presentation' => build_launch_presentation,

        # Custom claims
        'https://purl.imsglobal.org/spec/lti/claim/custom' => build_custom_claims,

        # Deployment ID
        'https://purl.imsglobal.org/spec/lti/claim/deployment_id' => integration.id.to_s,

        # Target link URI
        'https://purl.imsglobal.org/spec/lti/claim/target_link_uri' => redirect_uri
      }

      # Create JWT with RS256 algorithm
      JWT.encode(payload, rsa_private, 'RS256', { kid: generate_key_id(rsa_private) })
    end

    def build_launch_presentation
      config = integration&.lti_config || {}
      launch_config = config['launch_presentation'] || {}

      {
        document_target: launch_config['document_target'] || 'window',
        height: launch_config['height'] || 320,
        width: launch_config['width'] || 240,
        return_url: redirect_url
      }
    end

    def build_custom_claims
      {
        scenarioId: assessment.external_assessment_id
      }
    end

    def jwt_token
      JWT.encode({ 'sub' => subject.id, 'exp' => session_inactivity_timeout.from_now.to_i },
                 Settings.secrets.encrypted_key.to_s, 'HS256')
    end

    def subject
      @subject ||= user_assessment.subject
    end

    def user_assessment
      @user_assessment ||= UserAssessment.find_by_encoded_id(login_hint) # rubocop:disable Rails/DynamicFindBy
    end

    def assessment
      @assessment ||= user_assessment.assessment
    end

    def project
      @project ||= user_assessment.project
    end

    def session_inactivity_timeout
      subject.session_inactivity_timeout
    end

    def line_item_url
      Utility::Url.generate(
        :lti_ags_lineitem_url,
        line_item_id: user_assessment.encoded_id,
        subdomain: project.subdomain
      )
    end

    def redirect_url
      Utility::Url.generate(
        :lti_redirect_url,
        id: user_assessment.id,
        project_id: user_assessment.project.id,
        subdomain: user_assessment.project.subdomain,
        jwt: jwt_token
      )
    end

    def platform_base_url
      Utility::Url.generate(:root_url, subdomain: project.subdomain).chomp('/')
    end

    def source_app
      ENV.fetch('REAL_ENV', 'local').starts_with?('production') ? 'lighthouse-production' : 'lighthouse-testing'
    end

    def rsa_private
      private_key_content = ENV.fetch('LTI_PRIVATE_KEY', '')
      raise StandardError, 'LTI private key not configured' if private_key_content.blank?

      OpenSSL::PKey::RSA.new(private_key_content)
    end

    def generate_key_id(rsa_key)
      Digest::SHA256.hexdigest(rsa_key.to_s)[0, 22]
    end

    def maskable_identity
      @maskable_identity ||= Users::MaskableIdentity.new(
        subject,
        mask: true
      )
    end

    def update_lti_user_assessment_from_config
      if integration&.yoodli?
        user_assessment.yoodli_user_assessment&.update(email: maskable_identity.email)
      end
    end
  end
end
