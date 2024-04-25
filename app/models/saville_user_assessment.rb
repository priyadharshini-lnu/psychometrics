# frozen_string_literal: true

class SavilleUserAssessment < ApplicationRecord
  audited

  belongs_to :user_assessment

  delegate :user_reports, to: :user_assessment

  before_create -> { self.data_seprator = user_assessment.campaign.uniq_code }
end
