module UsersReports
  class GeneratePdfJob < ApplicationJob
    queue_as :reports

    def perform(users_report, current_user)
      @users_report     = users_report
      @report           = users_report.report
      @user             = users_report.subject
      @current_user     = current_user
      @project          = users_report.project

      generate_report
      save_to_assign_report
      remove_tmp_file
    end

    private

    attr_reader :users_report, :report, :user, :current_user, :project, :pdf_file

    # Generates PDF file and placed it into TMP folder
    #
    def generate_report
      @pdf_file = ::Exports::Reports::Pdf::ReportExport.export(current_user, report, user, project, lang: report.default_language)
    end

    # Uploads PDF file to AssignsReport
    #
    def save_to_assign_report
      File.open(pdf_file) do |file|
        users_report.status = :prepared
        users_report.pdf = file
        users_report.save
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
