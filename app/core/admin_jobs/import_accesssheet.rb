# frozen_string_literal: true

module AdminJobs
  class ImportAccesssheet < AdminJobs::Base
    include Rails.application.routes.url_helpers

    def call
      file = Roo::Excelx.new(record.file.url)
      current_sheet = campaign.sheets.find_by(type: 'Accesssheet')
      form = ::Sheets::SheetForm.new(file: file).with_context(sheet_type: 'Accesssheet', sheet: current_sheet)

      ::Sheets::ParseFile.call(form, campaign, 'Accesssheet')

      broadcast :ok
    end

    def generate_title_link
      {
        href: parent_resource_url,
        label: campaign.name
      }
    end

    def valid?
      campaign.present?
    end

    private

    def parent_resource_url
      "/admin/projects/#{campaign.project_id}/new_campaigns/#{campaign.id}/dashboard/accesssheets"
    end

    def campaign
      Campaign.find_by(id: record.data['campaign_id'])
    end
  end
end
