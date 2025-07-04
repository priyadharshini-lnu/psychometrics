# frozen_string_literal: true

module PowerBi
  class ExportToFile < Base
    private_attr_reader :report_id, :export_request, :group_id

    def initialize(report_id, export_request, group_id)
      @report_id = report_id
      @export_request = export_request
      @group_id = group_id
    end

    def call
      response = post("groups/#{group_id}/reports/#{report_id}/ExportTo", export_request)
      if response.success?
        JSON.parse(response.body)
      else
        raise "Power BI API error: #{response.status} - #{response.reason_phrase}"
      end
    end
  end
end
