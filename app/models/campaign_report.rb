# frozen_string_literal: true

class CampaignReport < ApplicationRecord
  belongs_to :campaign
  belongs_to :report
  belongs_to :report_family

  scope :by_specific_assessment_and_campaign, lambda { |assessment, campaign_id|
    where(
      'report_id IN (?) and campaign_id = (?)', assessment.reports.ids, campaign_id
    )
  }

  def user_reports
    UserReport.where(campaign_id: campaign_id, report_id: report_id)
  end
end
