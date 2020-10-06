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
      remove_user_assessments if options[:remove_user_assessments]
      campaign_assessment.destroy!
    end

    def remove_user_assessments
      UserAssessment.where(assessment: assessment, campaign_id: campaign).map(&:destroy!)
    end
  end
end
