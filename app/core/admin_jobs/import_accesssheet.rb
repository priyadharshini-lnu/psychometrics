# frozen_string_literal: true

module AdminJobs
  class ImportAccesssheet < AdminJobs::Base
    include Rails.application.routes.url_helpers

    def call
      file = Roo::Excelx.new(record.file.url)
      form = ::Sheets::SheetForm.new(file: file)

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
      "/administration/projects/#{campaign.project_id}/new_campaigns/#{campaign.id}/dashboard/accesssheets"
    end

    def campaign
      Campaign.find_by(id: record.data['campaign_id'])
    end
  end
end
