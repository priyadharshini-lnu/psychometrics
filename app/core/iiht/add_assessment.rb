# frozen_string_literal: true

module Iiht
  class AddAssessment < Base
    include Rails.application.routes.url_helpers

    DEFAULT_SCHEDULE_CONFIG = {
      'totalAttempts' => 2,
      'passPercentage' => 60,
      'duration' => 60
    }.freeze

    private_attr_reader :user_assessment

    def initialize(user_assessment)
      @user_assessment = user_assessment
      @project = user_assessment.project
    end

    def call
      response = client.post(
        'GetAssessmentURLAsync',
        request_body.to_json
      )
      result = ::JSON.parse(response.body)['result']
      unless result['isSuccess']
        raise "IIHT::AddAssessment failed for UserAssessment: #{user_assessment.id}. Error: #{result['errorMessage']}"
      end

      user_assessment.iiht_user_assessment.update!(
        url: result['scheduleLink'], schedule_id: result['scheduleId'], email: maskable_identity.email
      )
      ::Iiht::AllowAttempts.call!(user_assessment)

      broadcast :ok
    end

    private

    def request_body
      {
        tenantId: config['tenant_id'],
        assessmentIdNumber: user_assessment.assessment.external_settings[:assessment_id],
        userEmailAddress: maskable_identity.email,
        firstName: maskable_identity.first_name,
        lastName: maskable_identity.last_name,
        resultShareMode: [3],
        scheduleConfig: schedule_config
      }
    end

    def schedule_config
      schedule_config = DEFAULT_SCHEDULE_CONFIG.merge(
        user_assessment.assessment.external_settings[:schedule_config] || {},
        user_assessment.campaign_assessment&.external_config || {}
      )
      schedule_config.merge(
        externalScheduleConfigArgs: {
          campaign_id: user_assessment.campaign_id,
          assessment_id: user_assessment.assessment_id
        }.to_json,
        assessmentConfig: {
          enableShuffling: true,
          resultType: 4,
          redirectURL: iiht_assessment_redirect_url(
            host: Settings.domain,
            subdomain: user_assessment.project.subdomain,
            protocol: Settings.protocol,
            port: Settings.port,
            campaign_id: user_assessment.campaign_id,
            assessment_id: user_assessment.assessment_id,
            jwt: jwt_token
          )
        }
      )
    end

    def maskable_identity
      @maskable_identity ||= subject.maskable_identity(
        mask: user_assessment.project.mask_identity_for_iiht?
      )
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
  end
end
