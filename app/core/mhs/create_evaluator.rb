# frozen_string_literal: true

module Mhs
  class CreateEvaluator < Base
    MISSING_VALUE_INDICATOR = '-99'
    OBSERVATION_SET_NAME = 'Demographics (Scored)'

    private_attr_reader :user_assessment

    def initialize(user_assessment)
      @user_assessment = user_assessment
      @project = user_assessment.project
    end

    def call
      response = client.put do |req|
        req.url evaluator_url
        req.body = request_body.to_json
      end

      result = ::JSON.parse(response.body)

      if response.success?
        save_evaluation_results(result)
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
      raise Mhs::Exceptions::CreateEvaluatorFailed,
            "MHS::CreateEvaluator failed for UserAssessment: #{user_assessment.id}. Error: #{error_message}"
    end

    def handle_exception(exception)
      Sentry.capture_exception(exception, extra: {
        user_assessment_id: user_assessment.id,
        session_id: session_id,
        data_gatherer_id: data_gatherer_id,
        data_gathering_id: data_gathering_id
      })
      broadcast :error, exception.message
    end

    def evaluator_url
      "#{api_base_url}/sessions/#{session_id}/evaluators"
    end

    def request_body
      {
        evaluations: [
          {
            resourceType: 'Evaluation',
            evaluatorID: evaluator_id,
            measureID: measure_id,
            directives: {
              keyValuePairsArray: evaluator_directives
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

    def observation_item_sets
      mhs_user_assessment.observation_item_sets || []
    end

    def evaluator_id
      assessment_settings&.evaluators&.first&.id
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

    def external_user_id
      mhs_user_assessment.id.to_s
    end

    def evaluator_directives
      directives = [
        { key: 'NormRegion', value: mhs_user_assessment.norm_region.to_s },
        { key: 'NormOption', value: mhs_user_assessment.norm_option.to_s },
        { key: 'ConfidenceInterval', value: mhs_user_assessment.confidence_interval.to_s },
        { key: 'LeadershipBar', value: mhs_user_assessment.leadership_bar.to_s }
      ]

      directives.map do |directive|
        if directive[:key] == 'NormOption' && demographics_incomplete?
          adjust_norm_directive(directive)
        else
          directive
        end
      end
    end

    def save_evaluation_results(result)
      return unless result['resources']&.any?

      evaluation_resource = result['resources'].first
      outcome_item_sets = evaluation_resource['outcomeItemSets']

      return unless outcome_item_sets&.any?

      external_results_data = {
        evaluation_id: evaluation_resource['evaluationID'],
        evaluator_id: evaluation_resource['evaluatorID'],
        measure_id: evaluation_resource['measureID'],
        outcome_item_sets: outcome_item_sets,
        processed_at: Time.current.iso8601,
        source: 'mhs_evaluator'
      }

      users_result.external_results = external_results_data
      users_result.save!

      unless user_assessment.completed?
        user_assessment.update!(
          status: :completed,
          completed_at: Time.current
        )
      end
    end

    def users_result
      @users_result ||= user_assessment.users_result
    end

    def adjust_norm_directive(directive)
      overall_norm_value = directive[:value].to_s.include?('Professional') ? '3' : '1'
      directive.to_h.merge(value: overall_norm_value)
    end

    def demographics_incomplete?
      demographics_observation_set.nil? ||
        missing_demographic_values?(extract_demographic_data)
    end

    def demographics_observation_set
      @demographics_observation_set ||= find_observation_set(scored_demographics_source_id)
    end

    def extract_demographic_data
      items = get_demographic_items
      return {} if items.blank?

      { age: items[0], gender: items[1] }
    end

    def missing_demographic_values?(demographic_data)
      return true if demographic_data.empty?

      demographic_data.values.any? do |value|
        value == MISSING_VALUE_INDICATOR || value.blank?
      end
    end

    def scored_demographics_source_id
      assessment_settings&.observation_sets&.find { |os| os.name == OBSERVATION_SET_NAME }&.source_id
    end

    def find_observation_set(source_id)
      return nil unless source_id

      observation_item_sets.find do |item_set|
        item_set['interpretAs'] == source_id || item_set['sourceID'] == source_id
      end
    end

    def get_demographic_items
      return [] unless demographics_observation_set&.dig('observationValues', 'items')

      demographics_observation_set['observationValues']['items'].split('|')
    end
  end
end
