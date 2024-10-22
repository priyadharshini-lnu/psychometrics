# frozen_string_literal: true

class SimulationUserAssessment < ApplicationRecord
  audited

  belongs_to :user_assessment
end
