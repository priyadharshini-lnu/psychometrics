# frozen_string_literal: true

class UsersAssessment < ApplicationRecord
  belongs_to :user
  belongs_to :assessment
  belongs_to :campaign
end
