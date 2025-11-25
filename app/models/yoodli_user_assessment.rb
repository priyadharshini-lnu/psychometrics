# frozen_string_literal: true

class YoodliUserAssessment < ApplicationRecord
  audited

  belongs_to :user_assessment
  delegate :user_reports, to: :user_assessment
end
