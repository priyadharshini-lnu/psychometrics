# frozen_string_literal: true

class UserIdpDevelopmentAction < ApplicationRecord
  belongs_to :user_idp_plan
  belongs_to :development_action, optional: true
  belongs_to :user_idp_skill
  has_one :skill, through: :user_idp_skill
  has_one :user, through: :user_idp_plan
end
