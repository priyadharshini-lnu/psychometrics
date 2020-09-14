# frozen_string_literal: true

module CampaignAssessments
  class Remove < BaseCommand
    private_attr_reader :campaign_assessment, :campaign, :assessment

    def initialize(campaign_assessment, campaign)
      @campaign_assessment = campaign_assessment
      @assessment = campaign_assessment.assessment
      @campaign = campaign
    end

    def call
      remove_user_assessments_and_reports
      remove_campaign_assessment_and_report
    end

    def remove_user_assessments_and_reports
      @campaign.campaign_users.each do |campaign_user|
        UserAssessment.where(assessment: assessment, campaign_id: campaign,
          subject_id: campaign_user.user_id).each do |user_assessment|
          ::UserAssessments::Remove.call!(user_assessment, campaign)
        end
      end
    end

    def remove_campaign_assessment_and_report
      report_ids = assessment.reports.ids
      CampaignReport.where(
        'report_id IN (?) and campaign_id = (?)', report_ids, campaign.id
      ).each(&:destroy!)
      campaign_assessment.destroy!
    end
  end
end
