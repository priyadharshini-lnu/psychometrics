# frozen_string_literal: true

class CampaignReport < ApplicationRecord
  belongs_to :campaign
  belongs_to :report
  belongs_to :report_family
end
