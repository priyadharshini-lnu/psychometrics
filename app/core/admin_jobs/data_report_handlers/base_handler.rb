# frozen_string_literal: true

module AdminJobs
  module DataReportHandlers
    class BaseHandler
      attr_reader :data_report, :data_report_job, :file_path

      def initialize(data_report:, data_report_job:, file_path:)
        @data_report = data_report
        @data_report_job = data_report_job
        @file_path = file_path
      end

      def generate_file
        raise NotImplementedError, "#{self.class} must implement #generate_file"
      end

      delegate :file_extension, to: :class

      def self.file_extension
        raise NotImplementedError, "#{name} must implement .file_extension"
      end

      def self.file_name(report_name:, extension:)
        timestamp = Time.current.strftime('%Y%m%d')
        "#{timestamp}_#{report_name.parameterize(separator: '_')}.#{extension}"
      end

      protected

      def config
        @config ||= Oj.load(data_report.configuration)
      end

      def project_ids
        config['project_ids']
      end

      def campaign_ids
        config['campaign_ids']
      end

      def report_ids
        config['report_ids']
      end

      def activity_period
        config['activity_period']
      end

      def client_ids
        config['client_ids']
      end

      def year_range
        config['year_range']
      end

      def report_scope
        @report_scope ||= data_report.scope
      end

      def campaigns
        ids = campaign_ids
        ids = Project.where(id: project_ids).flat_map(&:project_campaign_ids) if ids.blank?

        @campaigns ||= ::Campaign.where(id: ids)
      end
    end
  end
end
