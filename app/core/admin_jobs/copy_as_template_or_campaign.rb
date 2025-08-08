# frozen_string_literal: true

module AdminJobs
  class CopyAsTemplateOrCampaign < AdminJobs::Base
    def call
      result = ::Threesixty::Campaigns::CopyAsTemplateOrCampaign.call(
        campaign,
        is_template: record.data['is_template']
      )

      if result[:ok]
        campaign = result[:ok][:campaign]

        record.update(data: record.data.merge(new_campaign_id: campaign.id))
        broadcast :ok
      else
        broadcast :error, result[:error]
      end
    end

    def generate_title_link
      campaign = ::Campaign.find_by(id: record.data['new_campaign_id'])

      return {} unless campaign

      {
        href: "/admin/projects/#{campaign.project_id}/new_campaigns/#{campaign.id}",
        label: campaign.name
      }
    end

    def valid?
      campaign.present?
    end
  end
end
