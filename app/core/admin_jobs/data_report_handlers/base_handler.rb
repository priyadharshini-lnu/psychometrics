# frozen_string_literal: true

module AdminJobs
  module DataReportHandlers
    class BaseHandler
      attr_reader :data_report, :data_report_job, :file_path

      def initialize(data_report:, data_report_job:, file_path:, runtime_configuration: nil)
        @data_report = data_report
        @data_report_job = data_report_job
        @file_path = file_path
        @runtime_configuration = runtime_configuration
      end

      def generate_file
        raise NotImplementedError, "#{self.class} must implement #generate_file"
      end

      delegate :file_extension, to: :class

      class << self
        def parameters
          @parameters ||= []
        end

        def parameter(name, type:, runtime_updatable: false, required: false, description: nil)
          parameters << {
            name: name.to_s,
            type: type.to_s,
            runtime_updatable: runtime_updatable,
            required: required,
            description: description
          }.freeze
        end

        def runtime_parameters
          parameters.select { |parameter| parameter[:runtime_updatable] }
        end

        def file_extension
          raise NotImplementedError, "#{name} must implement .file_extension"
        end

        def file_name(report_name:, extension:)
          timestamp = Time.current.strftime('%Y%m%d')
          "#{timestamp}_#{report_name.parameterize(separator: '_')}.#{extension}"
        end
      end

      protected

      def config
        @config ||= begin
          saved = Oj.load(data_report.configuration)

          @runtime_configuration.present? ? saved.merge(@runtime_configuration) : saved
        end
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

      def client_ids
        config['client_ids']
      end

      def report_scope
        @report_scope ||= data_report.scope
      end

      def campaigns
        ids = campaign_ids
        ids = Project.where(id: project_ids).flat_map(&:project_campaign_ids) if ids.blank?

        @campaigns ||= ::Campaign.where(id: ids)
      end

      def format_datetime(value)
        return value if value.blank?

        value.in_time_zone.strftime('%Y-%m-%d %H:%M:%S')
      end

      def format_csv_row(row)
        row.map do |value|
          if value.is_a?(Time) || value.is_a?(ActiveSupport::TimeWithZone)
            format_datetime(value)
          else
            value
          end
        end
      end
    end
  end
end
