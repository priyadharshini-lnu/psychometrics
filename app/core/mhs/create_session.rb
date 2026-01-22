# frozen_string_literal: true

module Mhs
  class CreateSession < Base
    private_attr_reader :user_assessment, :project

    def initialize(user_assessment)
      @user_assessment = user_assessment
      @project = user_assessment.project
    end

    def call
      response = client.post do |req|
        req.url session_url
        req.body = request_body.to_json
      end

      result = ::JSON.parse(response.body)

      if response.success?
        save_mhs_session(result)
        broadcast :ok, result
      else
        handle_failure(result)
      end
    rescue StandardError => e
      handle_exception(e)
    end

    private

    def handle_failure(result)
      error_message = result['error'] || result['message'] || 'Unknown error'
      raise Mhs::Exceptions::CreateSessionFailed,
            "MHS::CreateSession failed for UserAssessment: #{user_assessment.id}. Error: #{error_message}"
    end

    def handle_exception(exception)
      Sentry.capture_exception(exception, extra: {
        user_assessment_id: user_assessment.id,
        project_id: project.id
      })
      broadcast :error, exception.message
    end

    def save_mhs_session(result)
      mhs_user_assessment.update!(
        session_id: result['sessionID']
      )
    end

    def session_url
      "#{api_base_url}/sessions"
    end

    def request_body
      {
        sessionGroupName: session_group_name,
        measureID: measure_id,
        routingCode: routing_code,
        retentionPolicy: {
          type: 'Default'
        },
        host: {
          computeProvider: {},
          storageProvider: {},
          invokeAsAsynchronous: false
        },
        eventNotifications: event_notifications,
        runAs: run_as_config
      }
    end

    def session_group_name
      campaign.name
    end

    def routing_code
      Rails.env.production? ? 'Prod' : 'Dev'
    end

    def event_notifications
      {
        dataGathererComplete: true,
        dataGathererResultsAvailable: true,
        enrichmentComplete: true,
        evaluatorComplete: true
      }
    end

    def run_as_config
      {
        identifier: external_user_id
      }
    end

    def external_user_id
      mhs_user_assessment.id.to_s
    end

    def campaign
      @campaign ||= user_assessment.campaign
    end
  end
end
