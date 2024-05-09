# frozen_string_literal: true

class Skill < ApplicationRecord
  extend Mobility

  translates :name, :description

  has_many :skills_job_roles
  has_many :job_roles, through: :skills_job_roles
  has_many :skills_development_actions, dependent: :destroy
  has_many :development_actions, through: :skills_development_actions

  enum category: { behavioral: 0, technical: 1, other: 2 }

  # Search entity by word
  scope :search_query, lambda { |query|
    where('name ILIKE ?', "%#{query}%")
  }

  def self.ransackable_scopes(_auth_object = nil)
    %i[search_query]
  end
end
