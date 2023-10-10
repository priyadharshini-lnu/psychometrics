# frozen_string_literal: true

class ProctoringSession < ApplicationRecord
  audited

  belongs_to :campaign_user
  belongs_to :campaign
  has_one :license_usage

  scope :valid_sessions, -> { where(invalid_session: false) }
end
