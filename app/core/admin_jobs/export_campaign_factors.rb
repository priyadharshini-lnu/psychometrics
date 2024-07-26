# frozen_string_literal: true

module AdminJobs
  class ExportCampaignFactors < AdminJobs::BaseExportXlsx
    def valid?
      campaign.present?
    end

    def generate_title_link
      {
        href: "/admin/projects/#{campaign.project_id}/new_campaigns/#{campaign.id}/scoring/settings",
        label: "#{campaign.name} - factors"
      }
    end

    def generate_details
      [[I18n.t('administration.scoring.export.factors'), file_link]]
    end

    private

    def xlsx
      ::CampaignFactors::Export.call!(campaign)
    end

    def file_name
      'campaign_factors.xlsx'
    end
  end
end
