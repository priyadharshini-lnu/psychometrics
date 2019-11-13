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
      @pdf_file = ::Exports::Reports::Pdf::ReportExport.
                  export(current_user, report, user, project, lang: report.default_language)
    end

    # Uploads PDF file to AssignsReport
    #
    def save_to_assign_report
      file = File.open(pdf_file)
      AssignsReports::GetAllWithSameReportQuery.new(assigns_report).query.each do |assigns_report|
        assigns_report.generating = false
        assigns_report.pdf = file
        assigns_report.save
      end
      file.close
      notify_user if current_user.admin?
    end

    # Removes TMP folder
    #
    def remove_tmp_file
      dirname = File.dirname(pdf_file)
      FileUtils.remove_dir(dirname, true)
    end

    def notify_user
      ActionCable.server.broadcast "notification_channel_for_#{current_user.id}",
                                   type: 'success',
                                   message: I18n.t('jobs.reports_export.download.message'),
                                   description: I18n.t('jobs.reports_export.download.description',
                                                       report_name: report.name,
                                                       user_name: user.decorate.display_name,
                                                       url: assigns_report.reload.pdf.url)
    end
  end
end
