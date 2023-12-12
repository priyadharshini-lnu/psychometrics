# frozen_string_literal: true

module UserAssessments
  class GetLeadUserAssessment < BaseCommand
    attr_reader :campaign, :user

    def initialize(campaign, user)
      @campaign = campaign
      @user = user
    end

    def call
      lead_form = UserAssessment.where(campaign_id: campaign.id, subject_id: user.id).
                  joins(:assessment).find_by(assessments: { category: Assessment::CATEGORIES[:lead_assessor_form] })
      broadcast :ok, lead_form
    end
  end
end
