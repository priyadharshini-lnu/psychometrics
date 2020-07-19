# frozen_string_literal: true

module CampaignsUsersReports
  class GeneratePdfJob < ApplicationJob
    queue_as :reports

    def perform(campaigns_users_report, current_user)
      @campaigns_users_report = campaigns_users_report
      @report = campaigns_users_report.report
      @user = campaigns_users_report.user
      @current_user = current_user
      @project = campaigns_users_report.project

      generate_report
      save_to_assign_report
      remove_tmp_file
    end

    private

    attr_reader :campaigns_users_report, :report, :user, :current_user, :project, :pdf_file

    # Generates PDF file and placed it into TMP folder
    #
    def generate_report
      @pdf_file = ::Exports::Reports::Pdf::ReportExport.
                  export(current_user, report, user, project,
                         campaigns_users_report: campaigns_users_report, lang: report.default_language)
    end

    # Uploads PDF file to AssignsReport
    #
    def save_to_assign_report
      File.open(pdf_file) do |file|
        campaigns_users_report.status = :prepared
        campaigns_users_report.pdf = file
        campaigns_users_report.save
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
