# frozen_string_literal: true

class SavilleUserAssessment < ApplicationRecord
  belongs_to :user_assessment

  delegate :external_user_reports, to: :user_assessment
end
