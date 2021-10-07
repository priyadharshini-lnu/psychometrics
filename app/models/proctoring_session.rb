# frozen_string_literal: true

class ProctoringSession < ApplicationRecord
  belongs_to :campaign_user
  belongs_to :campaign
  has_one :license_usage
end
