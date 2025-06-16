# frozen_string_literal: true

module PowerBi
  class GetExportStatus < Base
    private_attr_reader :report_id, :export_id, :group_id

    def initialize(report_id, export_id, group_id)
      @report_id = report_id
      @export_id = export_id
      @group_id = group_id
    end

    def call
      response = get("groups/#{group_id}/reports/#{report_id}/exports/#{export_id}")
      if response.success?
        JSON.parse(response.body)
      else
        raise "Power BI API error: #{response.status} - #{response.reason_phrase}"
      end
    end
  end
end
