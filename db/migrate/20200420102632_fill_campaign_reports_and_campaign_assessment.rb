# frozen_string_literal: true

class FillCampaignReportsAndCampaignAssessment < ActiveRecord::Migration[5.1]
  def change
    Campaign.includes(:threesixty_campaign).find_each do |campaign|
      threesixty_campaign = campaign.threesixty_campaign

      if threesixty_campaign.assessment
        campaign.campaigns_assessments.create(assessment_id: threesixty_campaign.assessment_id)
      end

      campaign.campaigns_reports.create(report_id: threesixty_campaign.report_id) if threesixty_campaign.report
    end
  end
end
