# frozen_string_literal: true

module AdminJobs
  class BulkGenerateUserCampaignAIArtifactResults < AdminJobs::Base
    def call
      artifacts_count = campaign.campaign_ai_artifacts.count
      record.update(total_tasks: users.count * artifacts_count)

      users.find_each(batch_size: 200) do |user|
        AI::CampaignArtifacts::Processor.call(campaign, user, record.owner, record)
      end
    end

    def generate_title_link
      {
        href: "/admin/projects/#{campaign.project_id}/new_campaigns/#{campaign.id}/artifacts/subject_artifact_results",
        label: 'CampaignArtifacts'
      }
    end

    def valid?
      campaign.present?
    end

    private

    def users
      users = User.joins(:campaigns).where(campaigns: { id: campaign.id })

      users.where(id: record.data['user_ids'])
    end
  end
end
