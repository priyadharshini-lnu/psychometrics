# frozen_string_literal: true

class UserAssessmentFactorScore < ApplicationRecord
  belongs_to :user_assessment
  belongs_to :factor
end
