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
      # TODO: Fill this after hogan assessment flow. Hogan::FetchResult command can be used with some changes
    end
  end
end
