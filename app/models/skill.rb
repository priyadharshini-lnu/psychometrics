# frozen_string_literal: true

class Skill < ApplicationRecord
  extend Mobility

  translates :name, :description

  has_many :skills_job_roles
  has_many :job_roles, through: :skills_job_roles
  has_many :skills_development_actions, dependent: :destroy
  has_many :development_actions, through: :skills_development_actions

  enum category: { behavioral: 0, technical: 1, other: 2 }
end
