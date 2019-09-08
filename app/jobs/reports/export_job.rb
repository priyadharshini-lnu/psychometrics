# frozen_string_literal: true

module Reports
  class ExportJob < ApplicationJob
    queue_as :reports

    def perform(assigns_report, current_user)
      @assigns_report   = assigns_report
      @report           = assigns_report.report
      @user             = assigns_report.assign.membership.user
      @current_user     = current_user
      @project          = assigns_report.assign.membership.client.project

      generate_report
      save_to_assign_report
      remove_tmp_file
    end

    private

    attr_reader :assigns_report, :report, :user, :current_user, :project, :pdf_file

    # Generates PDF file and placed it into TMP folder
    #
    def generate_report
      @pdf_file = ::Exports::Reports::Pdf::ReportExport.export(current_user, report, user, project, lang: report.default_language)
    end

    # Uploads PDF file to AssignsReport
    #
    def save_to_assign_report
      File.open(pdf_file) do |file|
        assigns_report.generating = false
        assigns_report.pdf = file
        assigns_report.save
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
