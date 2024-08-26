# frozen_string_literal: true

module Mettl
  class RegisterCandidate < Base
    private_attr_reader :user_assessment, :project

    def initialize(user_assessment)
      @user_assessment = user_assessment
      @project = user_assessment.project
    end

    def call
      response = client.post(register_candidate_url)

      result = ::JSON.parse(response.body)

      unless result['status'] == 'SUCCESS'
        raise "Mettl::RegisterCandidate failed for UserAssessment: #{user_assessment.id}. Error: #{result['error']['message']}" # rubocop:disable Layout/LineLength
      end

      save_mettl_user_assessment(result['registrationStatus'].first)
    rescue StandardError => e
      Sentry.capture_exception(e, extra: {
        user_assessment_id: user_assessment.id, project_id: project.id
      })
      broadcast :ok, []
    end

    private

    def save_mettl_user_assessment(result)
      user_assessment.mettl_user_assessment.update!(
        url: result['url'], email: result['email'], mettl_schedule_record_id: mettl_schedule_record.id
      )
    end

    def register_candidate_url
      timestamp = Time.now.to_i

      signature = Mettl::GetSignature.call!(config, string_to_sign(timestamp))

      "#{api_endpoint}?ak=#{public_key}&ts=#{timestamp}&asgn=#{signature}&rd=#{encoded_request}"
    end

    def string_to_sign(timestamp)
      "#{http_method}#{api_endpoint}\n#{public_key}\n#{registration_details}\n#{timestamp}"
    end

    def registration_details
      {
        registrationDetails: [
          {
            'First Name': maskable_identity.first_name,
            'Last Name': maskable_identity.last_name,
            'Email Address': maskable_identity.email
          }
        ],
        optionalParams: [
          {
            email: maskable_identity.email,
            context_data: { token: jwt_token }.to_json
          }
        ]
      }.to_json
    end

    def encoded_request
      URI.encode_www_form_component(registration_details)
    end

    def http_method
      'POST'
    end

    def api_endpoint
      "#{Settings.mettl.base_api_url}/v2/schedules/#{mettl_schedule_record.access_key}/candidates"
    end

    def public_key
      config['public_key']
    end

    def mettl_schedule_record
      MettlScheduleRecord.find_by(assessment_id: user_assessment.assessment_id)
    end

    def maskable_identity
      @maskable_identity ||= user_assessment.subject.maskable_identity(
        mask: user_assessment.project.mask_identity_for_mettl?
      )
    end

    def jwt_token
      JWT.encode({ data: user_assessment.id, exp: 30.days.from_now.to_i }, Settings.secrets.webhook_jwt_secret)
    end
  end
end
