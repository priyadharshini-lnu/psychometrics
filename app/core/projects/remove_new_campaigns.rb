# frozen_string_literal: true

module Projects
  class RemoveNewCampaigns < BaseCommand
    private_attr_reader :project

    def initialize(project)
      @project = project
    end

    def call
      project.project_campaigns.each do |campaign|
        ApplicationRecord.transaction do
          delete_user_reports(campaign)
          delete_user_assessments(campaign)
          CampaignUser.where(campaign_id: campaign.id).delete_all
          threesixty_campaign = campaign.threesixty_campaign
          campaign.destroy!
          if threesixty_campaign
            dimension = threesixty_campaign.dimension
            threesixty_campaign.report.destroy!
            threesixty_campaign.assessment.destroy!
            dimension.destroy!
          end
        end
      end
      Rails.logger.info "Project #{project.id} New campaigns - Deleted"

      broadcast :ok
    end

    def delete_user_reports(campaign)
      user_reports = UserReport.where(campaign_id: campaign.id)
      path = UserReport.new.pdf.store_dir
      user_reports.pluck(:id, :pdf).each do |id, pdf_file|
        ObjectStorage::RemoveFileJob.perform_later(
          "#{path}/#{id}/#{pdf_file}", Rails.application.secrets.s3_compatible_storage[:private_bucket]
        )
      end
      user_reports.delete_all
    end

    def delete_user_assessments(campaign)
      SavilleUserAssessment.joins(:user_assessment).where(user_assessments: { campaign_id: campaign.id }).delete_all
      PearsonUserAssessment.joins(:user_assessment).where(user_assessments: { campaign_id: campaign.id }).delete_all
      IihtUserAssessment.joins(:user_assessment).where(user_assessments: { campaign_id: campaign.id }).delete_all
      delete_users_results(campaign)
      UserAssessment.where(campaign_id: campaign.id).delete_all
    end

    def delete_users_results(campaign)
      media_responses = MediaResponse.joins(users_result: :user_assessment).where(
        user_assessment: { campaign_id: campaign.id }
      )
      path = MediaResponse.new.asset.store_dir
      media_responses.pluck(:asset).each do |asset_file|
        ObjectStorage::RemoveFileJob.perform_later(
          "#{path}/#{asset_file}", Rails.application.secrets.s3_compatible_storage[:private_bucket]
        )
      end
      media_responses.delete_all
      MindmillCredential.joins(users_result: :user_assessment).
        where(user_assessments: { campaign_id: campaign.id }).delete_all
      AgileEvent.joins(users_result: :user_assessment).where(user_assessments: { campaign_id: campaign.id }).delete_all
      UsersResult.joins(:user_assessment).where(user_assessments: { campaign_id: campaign.id }).delete_all
    end
  end
end
