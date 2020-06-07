# frozen_string_literal: true

class UsersCampaignsAssessment < ApplicationRecord
  belongs_to :user
  belongs_to :assessment
  belongs_to :campaign
  belongs_to :project, class_name: 'Client'
  belongs_to :subject, class_name: 'User'
  belongs_to :evaluator, class_name: 'User'
  belongs_to :relationship
  belongs_to :users_result
end
