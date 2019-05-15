# frozen_string_literal: true

class UsersAssessment < ApplicationRecord
  belongs_to :user, inverse_of: :users_assessments
  belongs_to :assessment
  belongs_to :campaign
  has_many :users_results,
           ->(users_assessment) { where(assessment_id: users_assessment.assessment_id) },
           primary_key: :user_id,
           foreign_key: :evaluator_id
end
