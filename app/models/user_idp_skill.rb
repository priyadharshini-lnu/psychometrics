# frozen_string_literal: true

class UserIdpSkill < ApplicationRecord
  belongs_to :user_idp_plan
  belongs_to :skill
  has_one :user, through: :user_idp_plan
  has_many :user_idp_development_actions, dependent: :destroy
end
