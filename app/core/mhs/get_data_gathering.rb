# frozen_string_literal: true

module Mhs
  class GetDataGathering < Base
    private_attr_reader :user_assessment

    def initialize(user_assessment)
      @user_assessment = user_assessment
    end

    def call
      response = client.get do |req|
        req.url data_gathering_url
        req.params = url_params
      end

      result = ::JSON.parse(response.body)

      if response.success?
        save_observation_item_sets(result)
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
      raise Mhs::Exceptions::GetDataGatheringFailed,
            "MHS::GetDataGathering failed for UserAssessment: #{user_assessment.id}. Error: #{error_message}"
    end

    def handle_exception(exception)
      Sentry.capture_exception(exception, extra: {
        user_assessment_id: user_assessment.id,
        mhs_user_assessment_id: mhs_user_assessment.id,
        session_id: session_id,
        data_gatherer_id: data_gatherer_id,
        data_gathering_id: data_gathering_id
      })
      broadcast :error, exception.message
    end

    def data_gathering_url
      "#{api_base_url}/sessions/#{session_id}/dataGatherers/#{data_gatherer_id}/instances/#{data_gathering_id}"
    end

    def url_params
      {
        measureID: measure_id,
        format: 'JSON'
      }
    end

    def session_id
      mhs_user_assessment.session_id
    end

    def data_gatherer_id
      mhs_user_assessment.data_gatherer_id
    end

    def data_gathering_id
      mhs_user_assessment.data_gathering_id
    end

    def save_observation_item_sets(result)
      observation_item_sets = result['observationItemSets']
      return if observation_item_sets.blank?

      mhs_user_assessment.update!(
        observation_item_sets: observation_item_sets
      )
    end
  end
end
