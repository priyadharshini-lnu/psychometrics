# frozen_string_literal: true

module Mhs
  class CreateDataGatherer < Base
    MHS_GENDER_CODES = { 'male' => 0, 'female' => 1, 'not_disclosed' => 3 }.freeze

    private_attr_reader :session_id, :user_assessment

    def initialize(session_id, user_assessment)
      @session_id = session_id
      @user_assessment = user_assessment
      @project = user_assessment.project
    end

    def call
      return broadcast :ok if already_created?

      response = client.post do |req|
        req.url data_gatherer_url
        req.body = request_body.to_json
      end

      result = ::JSON.parse(response.body)

      if response.success?
        save_data_gatherer(result)
        broadcast :ok, result
      else
        handle_failure(result)
      end
    rescue StandardError => e
      handle_exception(e)
    end

    private

    def already_created?
      mhs_user_assessment.data_gatherer_id.present? && mhs_user_assessment.data_gathering_id.present?
    end

    def handle_failure(result)
      error_message = result['error'] || result['message'] || 'Unknown error'
      raise Mhs::Exceptions::CreateDataGathererFailed,
            "MHS::CreateDataGatherer failed for UserAssessment: #{user_assessment.id}. Error: #{error_message}"
    end

    def handle_exception(exception)
      Sentry.capture_exception(exception, extra: {
        user_assessment_id: user_assessment.id,
        project_id: project.id,
        session_id: session_id
      })
      broadcast :error, exception.message
    end

    def save_data_gatherer(result)
      mhs_user_assessment = user_assessment.mhs_user_assessment
      resource = result['resources']&.first

      if resource
        assessment_link = resource['links']&.find { |link| link['format'] == 'HTML' && link['rel'] == 'DataGatherer' }
        assessment_url = assessment_link&.dig('href')

        mhs_user_assessment.update!(
          data_gatherer_id: resource['dataGathererID'],
          data_gathering_id: resource['dataGatheringID'],
          url: assessment_url
        )
      end
    end

    def data_gatherer_url
      "#{api_base_url}/sessions/#{session_id}/dataGatherers"
    end

    def request_body
      {
        dataGatherings: [
          {
            resourceType: 'DataGathering',
            dataGathererID: data_gatherer_id,
            measureID: measure_id,
            directives: {
              keyValuePairsArray: default_directives
            },
            observationItemSets: observation_item_sets
          }
        ],
        retentionPolicy: {
          type: 'Default'
        },
        host: {
          computeProvider: {},
          storageProvider: {}
        },
        eventNotifications: {},
        runAs: {
          identifier: external_user_id
        }
      }
    end

    def data_gatherer_id
      assessment_settings&.data_gatherers&.first&.id
    end

    def external_user_id
      mhs_user_assessment.id.to_s
    end

    def default_directives
      assessment_settings&.data_gatherer&.directives || []
    end

    def observation_item_sets
      [{
        sourceID: data_gatherer_id,
        interpretAs: demographics_form_id,
        observationValues: {
          encodingSchema: 'Encoded',
          delimiter: '|',
          items: encoded_observation_items
        },
        thumbprint: generate_thumbprint,
        isValid: true
      }]
    end

    def encoded_observation_items
      user_profile = user_assessment.subject&.user_profile

      [
        user_profile&.age || '',
        mhs_gender_code(user_profile) || '',
        maskable_identity&.first_name || '',
        maskable_identity&.last_name || '',
        external_user_id
      ].join('|')
    end

    def generate_thumbprint
      GenerateThumbprint.new(
        data_gatherer_id,
        demographics_form_id,
        encoded_observation_items
      ).call
    end

    def maskable_identity
      @maskable_identity ||= user_assessment.subject.maskable_identity(
        mask: user_assessment.project.mask_identity_for_mhs?
      )
    end

    def mhs_gender_code(user_profile)
      MHS_GENDER_CODES[user_profile&.gender]
    end

    def demographics_form_id
      observation_set = assessment_settings&.observation_sets&.find { |os| os.name == 'Demographics (Scored)' }
      observation_set&.source_id
    end

    attr_reader :project
  end
end
