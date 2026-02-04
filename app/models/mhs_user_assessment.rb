# frozen_string_literal: true

class MhsUserAssessment < ApplicationRecord
  audited

  belongs_to :user_assessment

  delegate :user_reports, to: :user_assessment

  validates :confidence_interval, inclusion: { in: [0, 1] }
  validates :leadership_bar, inclusion: { in: [0, 1] }
  validates :norm_region, inclusion: { in: 0..8 }
  validates :norm_option, inclusion: { in: 0..3 }
end
