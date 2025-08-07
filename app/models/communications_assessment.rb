# frozen_string_literal: true

class CommunicationsAssessment < ApplicationRecord
  audited

  belongs_to :communication
  belongs_to :assessment
end
