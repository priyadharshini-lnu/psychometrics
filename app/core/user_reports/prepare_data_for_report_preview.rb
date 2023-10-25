# frozen_string_literal: true

module UserReports
  class PrepareDataForReportPreview < BaseCommand
    private_attr_reader :user_report, :report, :options

    def initialize(user_report, options)
      @user_report = user_report
      @report = @user_report.report
      @options = options
    end

    def call
      translations = Translation.to_hash_for_report(report.id, report.assessment_ids, options[:locale])

      broadcast :ok,
                user: Reports::UserSerializer.new(user_report.user).to_json,
                results: UserReports::GroupedResultsByAssessment.call!(user_report).to_json,
                user_report_data: UserReports::PrepareUserReportData.call!(user_report).to_json,
                data: ReportSerializer.new(
                  report,
                  user_results: user_report.user_results,
                  module_overrides: user_report.text_module_overrides,
                  piped_text_context: user_report.piped_text_context
                ).to_json(include: '**'),
                locales: translations.to_json
    end
  end
end
