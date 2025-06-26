# frozen_string_literal: true

module Pearson
  class SaveScoresAndReports < Base
    private_attr_reader :user_assessment, :pearson_user_assessment

    def initialize(user_assessment)
      @user_assessment = user_assessment
      @pearson_user_assessment = user_assessment.pearson_user_assessment
    end

    def call # rubocop:disable  Metrics/CyclomaticComplexity, Metrics/PerceivedComplexity,Metrics/AbcSize
      schedule_id = user_assessment.pearson_user_assessment.schedule_id
      response = client.get("v1/results/#{schedule_id}", query_params)
      scores_and_report = ::JSON.parse(response.body).dig('data', 'candidates', 0, 'products', 0, 'results')
      error_details = scores_and_report.dig('sessionData', 'errorDetails')
      scores = scores_and_report.dig('scores', 'items')
      report_items = scores_and_report.dig('reports', 'items').select { |item| item['type'].casecmp('pdf').zero? }

      if error_details.present?
        pearson_user_assessment.update!(error_details: error_details)
      end

      raise StandardError, 'Pearson assessment scores and reports not available' if scores.blank? && report_items.blank?

      if scores.present?
        user_result = user_assessment.users_result
        user_result.update(external_results: scores)
        user_assessment.update!(status: :completed, completed_at: Time.current) unless user_assessment.completed?
        generate_internal_reports
      end

      return broadcast :ok if report_items.blank?

      user_report = user_assessment.user_reports(:pearson).first
      return broadcast :ok unless user_report

      report_item = report_items.find do |item|
        item['languageCode']&.split('-')&.first == user_report.report.default_language
      end
      report_item ||= report_items.first
      user_report.attach_pdf!(report_item['url'], user_report.report_name_for_download) if report_item

      broadcast :ok
    end

    private

    def query_params
      params = {}
      if user_assessment.assessment.v2_pearson_assessment?
        params = {
          products: [
            {
              productId: user_assessment.assessment.external_assessment_id,
              normId: user_assessment.pearson_norm_id,
              reportId: [user_assessment.assessment.pearson_report_id]
            }
          ]
        }
      end
      params.merge(includeSessionData: 1)
    end

    def generate_internal_reports
      ::UsersResults::GenerateReports.call(
        user_assessment.users_result,
        user_assessment.user,
        exceptUserReportIds: user_assessment.user_reports(:pearson).pluck(:id)
      )
    end
  end
end
