# frozen_string_literal: true

class JobRole < ApplicationRecord
  extend Mobility

  translates :name, :description

  has_many :skills_job_roles
  has_many :skills, through: :skills_job_roles

  def self.ransackable_attributes(_auth_object = nil)
    %w[id name]
  end
end
