# frozen_string_literal: true

class IihtUserAssessment < ApplicationRecord
  audited

  belongs_to :user_assessment
end
