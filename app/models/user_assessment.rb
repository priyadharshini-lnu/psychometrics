# frozen_string_literal: true

class UserAssessment < ApplicationRecord
  belongs_to :user
  belongs_to :assessment
  belongs_to :campaign
  belongs_to :project, class_name: 'Client'
  belongs_to :subject, class_name: 'User'
  belongs_to :evaluator, class_name: 'User'
  belongs_to :relationship
  belongs_to :users_result
  has_one :mindmill_credential, through: :users_result

  delegate :selected_locale, to: :users_result

  def completed?
    users_result&.completed?
  end

  def user
    evaluator
  end

  alias result users_result
end
