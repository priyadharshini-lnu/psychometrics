# frozen_string_literal: true

module CampaignAssessments
  class Remove < BaseCommand
    private_attr_reader :campaign_assessment, :campaign, :assessment, :options

    def initialize(campaign_assessment, campaign, options = {})
      @campaign_assessment = campaign_assessment
      @assessment = campaign_assessment.assessment
      @options = options
      @campaign = campaign
    end

    def call
      remove_user_assessments_and_reports if options[:remove_user_assessments]
      remove_campaign_assessment_and_report
    end

    def remove_user_assessments_and_reports
      UserAssessment.where(assessment: assessment, campaign_id: campaign).each do |user_assessment|
        ::UserAssessments::Remove.call!(user_assessment, campaign)
      end
    end

    def remove_campaign_assessment_and_report
      report_ids = assessment.report_ids
      CampaignReport.where(report_id: report_ids, campaign_id: campaign.id).each(&:destroy!)
      campaign_assessment.destroy!
    end
  end
end
