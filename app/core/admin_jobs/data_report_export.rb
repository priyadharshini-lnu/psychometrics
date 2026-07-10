# frozen_string_literal: true

module AdminJobs
  class DataReportExport < ::AdminJobs::BaseExportXlsx
    REPORT_TYPE_HANDLERS = {
      'json_data_report' => DataReportHandlers::JsonDataReportHandler,
      'user_reports_export' => DataReportHandlers::UserReportsHandler,
      'report_usage_summary' => DataReportHandlers::ReportUsageSummaryHandler,
      'hogan_usage_report' => DataReportHandlers::HoganUsageHandler,
      'saville_usage_report' => DataReportHandlers::SavilleUsageHandler,
      'user_created_dates' => DataReportHandlers::UserCreatedDatesExport,
      'pearson_usage_report' => DataReportHandlers::PearsonUsageHandler,
      'client_assessment_counts' => DataReportHandlers::ClientAssessmentsCountHandler,
      'active_clients_projects' => DataReportHandlers::ActiveClientsProjectsHandler,
      'user_access_review' => DataReportHandlers::UserAccessReviewHandler,
      'campaign_factor_scores' => DataReportHandlers::CampaignFactorScoresHandler
    }.freeze

    def initialize(record, _stage = nil)
      super
      unless data_report_job
        @data_report_job = data_report.data_report_jobs.create(created_by_id: record.owner_id,
                                                               admin_job_record_id: record.id)
        record.update(data: record.data.merge(data_report_job_id: @data_report_job.id))
      end
    end

    def generate_details
      []
    end

    def call
      unless valid?
        data_report_job.update!(status: :completed_with_errors)
        job_record.update(exception: I18n.t('errors.messages.data_report_blank'))
        job_record.completed!
        return broadcast :ok
      end

      generate_export
      zip_and_protect
      data_report_job.update!(status: :completed, file: File.open(zip_file_name))
      clean_up
      job_record.complete!

      broadcast :ok
    rescue StandardError => e
      data_report_job.update!(status: :completed_with_errors)
      job_record.update!(exception: e.message)
      job_record.completed!
      broadcast :failed
    end

    def generate_export
      handler = handler_class.new(
        data_report: data_report,
        data_report_job: data_report_job,
        file_path: file_path
      )
      handler.generate_file
    end

    def file_extension
      @file_extension ||= handler_class.file_extension
    end

    def zip_and_protect
      enc = Zip::TraditionalEncrypter.new(data_report_job.password)
      buffer = Zip::OutputStream.write_buffer(::StringIO.new(+''), enc) do |output|
        output.put_next_entry(file_name)
        output.write File.read(file_path)
      end
      File.binwrite(zip_file_name, buffer.string)
    end

    def clean_up
      FileUtils.remove_file(file_path)
    end

    def file_path
      @file_path ||= begin
        directory = Rails.root.join('tmp', export_name, record.id.to_s)
        FileUtils.mkdir_p(directory)
        directory.join(file_name)
      end
    end

    def zip_file_name
      file_path.to_s.gsub(/\.(xlsx|csv)$/, '.zip')
    end

    def file_name
      @file_name ||= handler_class.file_name(
        report_name: data_report.name,
        extension: file_extension
      )
    end

    def handler_class
      REPORT_TYPE_HANDLERS.fetch(data_report.report_type) do
        raise ArgumentError, "Unsupported data_report.report_type=#{data_report.report_type}"
      end
    end

    def data_report
      @data_report ||= ::DataReport.find_by(id: record.data['data_report_id'])
    end

    def data_report_job
      @data_report_job ||= ::DataReportJob.find_by(id: record.data['data_report_job_id'])
    end

    def client
      @client ||= ::Client.find_by(id: record.data['client_id'])
    end

    def valid?
      return false if data_report.blank? || data_report_job.blank?

      true
    end
  end
end
