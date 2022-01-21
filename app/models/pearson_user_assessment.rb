# frozen_string_literal: true

class PearsonUserAssessment < ApplicationRecord
  belongs_to :user_assessment

  delegate :external_user_reports, to: :user_assessment
end
