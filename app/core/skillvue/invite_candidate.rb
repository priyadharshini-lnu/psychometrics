# frozen_string_literal: true

module Skillvue
  class InviteCandidate < Base
    private_attr_reader :user_assessment, :project

    def initialize(user_assessment)
      @user_assessment = user_assessment
      @project = user_assessment.project
    end

    def call
      response = client.post do |req|
        req.url invitation_url
        req.body = request_body
      end

      result = ::JSON.parse(response.body)

      if response.success?
        save_skillvue_user_assessment(result)
        broadcast :ok
      else
        handle_failure(result)
      end
    rescue StandardError => e
      handle_exception(e)
    end

    private

    def handle_failure(result)
      raise Skillvue::Exceptions::InviteCandidateFailed,
            "Skillvue::InviteCandidate failed for UserAssessment: #{user_assessment.id}. Error: #{result['message']}"
    end

    def handle_exception(exception)
      Sentry.capture_exception(exception, extra: {
        user_assessment_id: user_assessment.id,
        project_id: project.id
      })
      broadcast :ok
    end

    def save_skillvue_user_assessment(result)
      user_assessment.skillvue_user_assessment.update!(
        url: result['data']['interview_url'],
        email: result['data']['candidate']['email'],
        external_user_id: result['data']['candidate']['id']
      )
    end

    def invitation_url
      "#{Settings.skillvue.base_api_url}/v1/assessments/#{product_id}/invite"
    end

    def request_body
      body = {
        id: encoded_user_assessment_id,
        name: maskable_identity.first_name,
        surname: maskable_identity.last_name,
        email: email,
        redirect_url: redirect_url
      }

      body.to_json
    end

    def redirect_url
      Utility::Url.generate(
        :redirect_skillvue_user_assessment_url,
        id: user_assessment.id,
        project_id: project.id,
        subdomain: project.subdomain,
        jwt: jwt_token
      )
    end

    def product_id
      assessment.external_assessment_id
    end

    def http_method
      'POST'
    end

    def maskable_identity
      @maskable_identity ||= user_assessment.subject.maskable_identity(
        mask: user_assessment.project.mask_identity_for_skillvue?
      )
    end

    def email
      @email ||= "#{SecureRandom.hex(10)}@example.com"
    end

    def encoded_user_assessment_id
      @encoded_user_assessment_id ||= ::UserAssessment.encode_id(user_assessment.id)
    end

    def jwt_token
      JWT.encode({ 'sub' => subject.id, 'exp' => session_inactivity_timeout.from_now.to_i },
                 Settings.secrets.encrypted_key.to_s, 'HS256')
    end

    def session_inactivity_timeout
      subject.session_inactivity_timeout
    end

    def subject
      @subject ||= user_assessment.subject
    end

    def assessment
      @assessment ||= user_assessment.assessment
    end
  end
end
