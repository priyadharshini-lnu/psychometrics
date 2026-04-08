# frozen_string_literal: true

module AdminJobs
  class ExportCampaignDatasheet < AdminJobs::BaseExportXlsx
    def valid?
      campaign.present?
    end

    def generate_title_link
      {
        href: "/admin/projects/#{campaign.project_id}/new_campaigns/#{campaign.id}/datasheet",
        label: "#{campaign.name} - datasheet"
      }
    end

    def generate_details
      [['File', file_link]]
    end

    private

    def xlsx
      results = campaign.sheets.find_by(type: sheet_type)
      ::Sheets::Export.call!(results)
    end

    def file_name
      "#{campaign.name}-#{sheet_type.downcase}-export.xlsx"
    end

    def sheet_type
      record.data['sheet_type']
    end
  end
end
