# frozen_string_literal: true

module AdminJobs
  class BulkRescoreCampaignFactors < AdminJobs::Base
    def call
      users.find_each do |user|
        ::CampaignScoring::Rescore.call!(campaign, user)
      end

      broadcast :ok
    end

    def generate_title_link
      {
        href: "admin/projects/#{campaign.client.id}/new_campaigns/#{campaign.id}/scoring/subject_scores",
        label: 'CampaignScorings'
      }
    end

    def valid?
      campaign.present?
    end

    private

    def users
      @users ||= User.where(id: record.data['user_ids'])
    end
  end
end
