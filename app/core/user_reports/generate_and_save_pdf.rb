# frozen_string_literal: true

module UserReports
  class GenerateAndSavePdf < BaseCommand
    private_attr_reader :current_user, :campaign, :report, :user, :user_reports, :options

    def initialize(user_reports, current_user, options = {})
      @user_reports = Array.wrap(user_reports)
      @current_user = current_user
      @options = options
    end

    def call
      user_reports.each do |user_report|
        next if user_report.user_results.where.not(status: :completed).exists?

        user_report.update(status: :generating)

        report = user_report.report

        generate_mindminl_report(user_report) if report.mindmill?
        generate_hogan_report(user_report) if report.hogan?
        generate_internal_report(user_report) if report.provider_internal?
      end

      broadcast :ok
    end

    def generate_internal_report(user_report)
      pdf_file_path = UserReports::GeneratePdf.call!(user_report, current_user, options)

      File.open(pdf_file_path) { |file| user_report.update!(status: :prepared, pdf: file) }
    end

    def generate_mindminl_report(user_report)
      Mindmill::LoadResultsJob.perform_later(user_report.user_results.first, current_user)
    end

    def generate_hogan_report(user_report)
      # TODO: Take care of this with https://tte.atlassian.net/browse/LH-966.
      # Need to pass user_assessment as first parameter
      # Hogan::FetchResultsJob.perform_later(user_report.user_results.first, current_user, user_report.project)
    end
  end
end
