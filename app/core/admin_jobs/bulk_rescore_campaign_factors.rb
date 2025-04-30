# frozen_string_literal: true

module AdminJobs
  class BulkRescoreCampaignFactors < AdminJobs::Base
    def call
      record.update(total_tasks: users.count)

      users.find_each(batch_size: 200) do |user|
        record.increment_completed_tasks!
        ::CampaignScoring::Rescore.call!(campaign, user)
      end

      GC.start

      broadcast :ok
    end

    def generate_title_link
      {
        href: 'subject_scores',
        label: 'CampaignScorings'
      }
    end

    def valid?
      campaign.present?
    end

    private

    def users
      users = User.joins(:campaign_users).where(campaign_users: { campaign_id: campaign.id })

      users = users.where.not(id: record.data['excluded_user_ids']) if record.data['excluded_user_ids'].present?
      users = users.where(id: record.data['user_ids']) if record.data['user_ids'].present?

      users
    end
  end
end
