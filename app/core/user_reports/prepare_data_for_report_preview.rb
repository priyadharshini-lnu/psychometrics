# frozen_string_literal: true

module UserReports
  class PrepareDataForReportPreview < BaseCommand
    private_attr_reader :user_report, :report, :options, :view_report_as

    def initialize(user_report, options)
      @user_report = user_report
      @report = @user_report.report
      @options = options
      @view_report_as = options[:view_report_as]
    end

    def call
      translations = Translation.to_hash_for_report(report.id, report.assessment_ids, options[:locale])

      broadcast :ok,
                user: Reports::UserSerializer.new(user_report.user).to_json,
                results: UserReports::GroupedResultsByAssessment.call!(user_report, view_report_as).to_json,
                user_report_data: UserReports::PrepareUserReportData.call!(user_report).to_json,
                data: ReportSerializer.new(
                  report,
                  user_results: user_report.user_results,
                  module_overrides: user_report.text_module_overrides,
                  piped_text_context: user_report.piped_text_context
                ).to_json(include: '**'),
                campaign_factor_results: campaign_factor_results.to_json,
                locales: translations.to_json
    end

    private

    def campaign_factor_results
      user_report.campaign.campaign_factor_values.where(
        user_id: user_report.user_id, campaign_factors: { public_visibility: true }
      ).includes(:campaign_factor).map do |cfv|
        {
          code: cfv.campaign_factor.code,
          value: cfv.value
        }
      end
    end
  end
end
