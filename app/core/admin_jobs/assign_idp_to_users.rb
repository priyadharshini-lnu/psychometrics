# frozen_string_literal: true

module AdminJobs
  class AssignIdpToUsers < AdminJobs::Base
    def call
      count = 0
      transaction do
        campaign.campaign_users.find_each do |campaign_user|
          Idp::AssignUserIdp.call!(campaign_user.user, record.data['idp_template_id'], campaign.id, job_record.owner)
          count += 1
        end
        record.update!(completed_tasks: count)
      end
      broadcast :ok
    rescue Licenses::NotEnoughError => e
      job_record.complete!([e.message])
    end

    def generate_title_link
      {
        href: "/admin/projects/#{campaign.project.id}/new_campaigns/#{campaign.id}/participants/subjects",
        label: campaign.name
      }
    end

    def generate_details
      [
        [I18n.t('campaign.campaigns'), campaign.name]
      ]
    end

    def valid?
      campaign.present?
    end

    private

    def campaign
      @campaign ||= Campaign.find(record.data['campaign_id'])
    end
  end
end
