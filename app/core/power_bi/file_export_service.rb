# frozen_string_literal: true

module PowerBi
  class FileExportService
    private_attr_reader :parameters, :identities

    def initialize(parameters, identities)
      @parameters = parameters
      @identities = identities
    end

    def call
      export_powerbi_dashboard
    end

    private

    def config
      @config ||= Settings.secrets.power_bi
    end

    def export_powerbi_dashboard
      report_id = parameters['report_id']
      dataset_id = parameters['dataset_id']

      export_request = {
        format: parameters['format'],
        powerBIReportConfiguration: {
          identities: [
            {
              roles: ['self'],
              datasets: [dataset_id]
            }.merge(identities),
            {
              settings: {
                includeHiddenPages: false
              }
            }
          ]
        }.tap do |config|
          config[:pages] = [{ pageName: parameters['current_page_name'] }] if parameters['only_current_tab']
        end
      }

      export_response = ::PowerBi::ExportToFile.new(report_id, export_request, config[:group_id]).call
      export_id = export_response['id']

      poll_export_completion(report_id, export_id)
    end

    def poll_export_completion(report_id, export_id)
      max_attempts = 60
      attempt = 0

      loop do
        attempt += 1
        status_response = ::PowerBi::GetExportStatus.new(report_id, export_id, config[:group_id]).call
        status = status_response['status']

        case status
          when 'Succeeded'
            return ::PowerBi::GetExportFile.new(report_id, export_id, config[:group_id]).call
          when 'Failed'
            raise "Export failed: #{status_response['error']}"
          when 'Running', 'NotStarted'
            if attempt >= max_attempts
              raise "Export timed out after #{max_attempts} attempts"
            end

            sleep 5
          else
            raise "Unknown export status: #{status}"
        end
      end
    end
  end
end
