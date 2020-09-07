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

        pdf_file_path = UserReports::GeneratePdf.call!(user_report, current_user, options)

        File.open(pdf_file_path) { |file| user_report.update!(status: :prepared, pdf: file) }
      end
    end
  end
end
