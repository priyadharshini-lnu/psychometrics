# frozen_string_literal: true

module BulkReports
  class ExportJob < ApplicationJob
    queue_as :default

    def perform(report:, bulk_report:, user:, assign:, assigns_report:)
      @report         = report
      @bulk_report    = bulk_report
      @user           = user
      @assign         = assign
      @assigns_report = assigns_report

      # TODO: Should be refactored together with task #59
      report_file = if report.external_report?
                      mindmill_report = assign.mindmill_report.file
                      hogan_report = assigns_report.external_report.file
                      mindmill_report || hogan_report
                    else
                      assigns_report.pdf.file
                    end
      return unless report_file

      make_path
      download_report(report_file)
    end

    private

    attr_accessor :report, :bulk_report, :user, :assign, :assigns_report, :output

    # Creates folder and file for a report
    #
    def make_path
      dir = bulk_report.input_dir
      dir = File.join(dir, user.email)
      filename = "#{user.email}_#{report.decorate.display_name.parameterize}_#{Date.today.strftime('%F')}.pdf"

      FileUtils.mkdir_p(dir)
      @output = File.join(dir, filename)
    end

    # Downloads report from S3 and put it to local folder
    #
    def download_report(report_file)
      url = URI(report_file.url)
      url.scheme = 'http'
      IO.copy_stream(open(url.to_s), output) # rubocop:disable Security/Open
    rescue OpenURI::HTTPError
      Rails.logger.error "Unprocessable Entity #{report_file}"
    end
  end
end
