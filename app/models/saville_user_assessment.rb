# frozen_string_literal: true

class SavilleUserAssessment < ApplicationRecord
  audited

  belongs_to :user_assessment

  delegate :user_reports, to: :user_assessment

  before_create :set_default_data_seprator, if: proc { data_seprator.nil? }

  def set_default_data_seprator
    self.data_seprator = user_assessment.campaign.uniq_code
  end
end
