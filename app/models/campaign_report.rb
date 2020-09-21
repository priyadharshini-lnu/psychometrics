# frozen_string_literal: true

class CampaignReport < ApplicationRecord
  belongs_to :campaign
  belongs_to :report
  belongs_to :report_family

  def user_reports
    UserReport.where(campaign_id: campaign_id, report_id: report_id)
  end
end
