# frozen_string_literal: true

class UserIdpPlan < ApplicationRecord
  belongs_to :user
  belongs_to :idp_template
  belongs_to :creator, class_name: 'User'
  has_many :user_idp_skills, dependent: :destroy
  has_many :skills, through: :user_idp_skills
  has_many :user_idp_development_actions, dependent: :destroy
  has_many :development_actions, through: :user_idp_development_actions

  enum status: { draft: 0, pending_approval: 1, approved: 2 }
end
