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
            report = threesixty_campaign.report
            assessment = threesixty_campaign.assessment

            # Below conditions checks before deleting assessment, report and dimension is due to
            # some of this resource referenced outside 360 campaign
            unless CampaignReport.exists?(report_id: report.id) || UserReport.exists?(report_id: report.id)
              report.destroy!
            end
            unless CampaignAssessment.exists?(assessment_id: assessment.id) ||
                   UserAssessment.exists?(assessment_id: assessment.id) ||
                   AssessmentsReport.exists?(assessment_id: assessment.id)
              assessment.destroy!
            end
            unless Assessment.exists?(dimension_id: dimension.id)
              dimension.destroy!
            end
          end
        end
      end
      Rails.logger.info "Project #{project.id} New campaigns - Deleted"

      broadcast :ok
    end

    def delete_user_reports(campaign)
      user_reports = UserReport.where(campaign_id: campaign.id)
      user_reports.each { |user_report| user_report.pdf_file&.purge_later }
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

      media_responses.each do |media_response|
        media_response.asset&.purge_later
      end
      media_responses.delete_all
      MindmillCredential.joins(users_result: :user_assessment).
        where(user_assessments: { campaign_id: campaign.id }).delete_all
      AgileEvent.joins(users_result: :user_assessment).where(user_assessments: { campaign_id: campaign.id }).delete_all
      UsersResult.joins(:user_assessment).where(user_assessments: { campaign_id: campaign.id }).delete_all
    end
  end
end
