# frozen_string_literal: true

module UserReports
  class GeneratePdfJob < ApplicationJob
    queue_as :reports

    def perform(user_report, current_user)
      @user_report = user_report
      @report = user_report.report
      @user = user_report.user
      @current_user = current_user
      @project = user_report.project

      generate_report
      save_to_assign_report
      remove_tmp_file
    end

    private

    attr_reader :user_report, :report, :user, :current_user, :project, :pdf_file

    # Generates PDF file and placed it into TMP folder
    #
    def generate_report
      @pdf_file = ::Exports::Reports::Pdf::ReportExport.
                  export(current_user, report, user, project,
                         user_report: user_report, lang: report.default_language)
    end

    # Uploads PDF file to AssignsReport
    #
    def save_to_assign_report
      File.open(pdf_file) do |file|
        user_report.status = :prepared
        user_report.pdf = file
        user_report.save
      end
    end

    # Removes TMP folder
    #
    def remove_tmp_file
      dirname = File.dirname(pdf_file)
      FileUtils.remove_dir(dirname, true)
    end
  end
end
