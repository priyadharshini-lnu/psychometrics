# frozen_string_literal: true

module AdminJobs
  class ThreesixtyCampaignExportCompletionStatus < BaseExportXlsx
    def valid?
      threesixty_campaign.present?
    end

    def generate_title_link
      {
        href: "/administration/clients/#{project.parent_id}/projects/#{project.id}threesixty_campaigns/" \
              "#{threesixty_campaign.id}/participants/subjects",
        label: threesixty_campaign.name
      }
    end

    def generate_details
      [[I18n.t('administration.clients.threesixty_campaign'), file_link || threesixty_campaign.name]]
    end

    private

    def xlsx
      ::Threesixty::Campaigns::ExportCompletionStatus.call!(threesixty_campaign)
    end

    def file_name
      "completion_status_export_campaign_#{threesixty_campaign.id}.xlsx"
    end

    def threesixty_campaign
      @threesixty_campaign ||= Threesixty::Campaign.find_by(id: record.data['threesixty_campaign_id'])
    end

    def project
      @project ||= threesixty_campaign.campaign.project
    end
  end
end
