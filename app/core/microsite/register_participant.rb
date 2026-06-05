# frozen_string_literal: true

module Microsite
  class RegisterParticipant < Base
    include Rails.application.routes.url_helpers

    private_attr_reader :user_assessment

    def initialize(user_assessment)
      @user_assessment = user_assessment
      super(user_assessment.project)
    end

    def call
      response = client.post(api_endpoint, request_body)

      if response.success?
        save_microsite_user_assessment(response.body)
        broadcast :ok
      else
        handle_failure(response.body)
      end
    rescue Microsite::Exceptions::RegisterParticipantFailed
      raise
    rescue StandardError => e
      handle_exception(e)
    end

    private

    def api_endpoint
      "#{base_url}/api/v1/participants"
    end

    def handle_failure(result)
      update_registration_failed(result['message'] || 'Unknown error')
      error_msg = "RegisterParticipant failed for UserAssessment: #{user_assessment.id}"
      raise Microsite::Exceptions::RegisterParticipantFailed, error_msg
    end

    def handle_exception(exception)
      update_registration_failed(exception.message)
      Sentry.capture_exception(exception, extra: {
        user_assessment_id: user_assessment.id,
        project_id: project.id
      })
      raise exception
    end

    def update_registration_failed(message)
      microsite_user_assessment.update!(
        registration_status: :failed,
        error_message: message
      )
    end

    def save_microsite_user_assessment(result)
      microsite_user_assessment.update!(
        url: result.dig('data', 'assessment_url'),
        registration_status: :registered,
        error_message: nil
      )
    end

    def microsite_user_assessment
      @microsite_user_assessment ||= find_or_create_microsite_user_assessment
    end

    def find_or_create_microsite_user_assessment
      existing = user_assessment.microsite_user_assessment
      return user_assessment.create_microsite_user_assessment!(participant_id: SecureRandom.uuid) unless existing

      existing.update!(participant_id: SecureRandom.uuid) if existing.participant_id.blank?
      existing
    end

    def generated_participant_id
      microsite_user_assessment.participant_id
    end

    def request_body
      {
        participant_id: generated_participant_id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        campaign_id: campaign.id,
        campaign_name: campaign.name,
        project_id: project.id,
        microsite_assessment_id: assessment.external_assessment_id,
        auth_callback_url: auth_callback_url,
        results_callback_url: results_callback_url
      }
    end

    def auth_callback_url
      Utility::Url.generate(:webhooks_microsite_auth_url, subdomain: project.subdomain)
    end

    def results_callback_url
      Utility::Url.generate(:webhooks_microsite_results_url, subdomain: project.subdomain)
    end

    def user
      @user ||= user_assessment.subject
    end

    def campaign
      @campaign ||= user_assessment.campaign
    end

    def assessment
      @assessment ||= user_assessment.assessment
    end
  end
end
