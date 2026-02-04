# frozen_string_literal: true

module Mhs
  class CreateEnrichmentResult < Base
    private_attr_reader :user_assessment, :user_report

    def initialize(user_assessment, user_report)
      @user_assessment = user_assessment
      @user_report = user_report
    end

    def call
      response = client.post do |req|
        req.url enrichment_url
        req.headers['Content-Type'] = 'application/json'
        req.body = request_body.to_json
      end

      result = ::JSON.parse(response.body)

      if response.success?
        pdf_url = extract_pdf_url(result)
        if pdf_url
          broadcast :ok, { enrichment: result, pdf: pdf_url }
        else
          broadcast :ok, { enrichment: result, pdf: nil }
        end
      else
        handle_failure(result)
      end
    rescue StandardError => e
      handle_exception(e)
    end

    private

    def handle_failure(result)
      error_message = result['error'] || result['message'] || 'Unknown error'
      raise Mhs::Exceptions::CreateEnrichmentResultFailed,
            "MHS::CreateEnrichmentResult failed for UserAssessment: #{user_assessment.id}. Error: #{error_message}"
    end

    def handle_exception(exception)
      Sentry.capture_exception(exception, extra: {
        user_assessment_id: user_assessment.id,
        session_id: session_id,
        enrichment_id: enrichment_id
      })
      broadcast :error, exception.message
    end

    def enrichment_url
      "#{api_base_url}/sessions/#{session_id}/enrichments"
    end

    def request_body
      {
        enrichmentResults: [
          {
            resourceType: 'Enrichment',
            enrichmentID: enrichment_id,
            measureID: measure_id,
            directives: {
              keyValuePairsArray: enrichment_directives
            },
            observationItemSets: observation_item_sets,
            outcomeItemSets: outcome_item_sets
          }
        ],
        retentionPolicy: {
          type: 'Default'
        },
        host: {
          computeProvider: {},
          storageProvider: {},
          invokeAsAsynchronous: false
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

    def outcome_item_sets
      user_assessment.users_result.external_results['outcome_item_sets'] || []
    end

    def enrichment_id
      user_report.report.external_settings[:report_id]
    end

    def session_id
      mhs_user_assessment.session_id
    end

    def external_user_id
      mhs_user_assessment.id.to_s
    end

    def enrichment_directives
      report_settings = assessment_settings&.reports&.find { |r| r.id == enrichment_id }
      report_settings&.directives || []
    end

    def measure_id
      user_assessment.assessment.external_assessment_id || "measure-#{user_assessment.assessment_id}"
    end

    def mhs_user_assessment
      @mhs_user_assessment ||= user_assessment.mhs_user_assessment
    end

    def extract_pdf_url(result)
      return unless result['resources']&.any?

      resource = result['resources'].first
      links = resource['links'] || []
      pdf_link = links.find { |link| link['format'] == 'PDF' }
      url = pdf_link&.dig('href')

      Rails.logger.info "Extracted PDF URL: #{url}" if url
      url
    end
  end
end
