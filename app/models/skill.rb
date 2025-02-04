# frozen_string_literal: true

class Skill < ApplicationRecord
  extend Mobility
  include Taggable

  SAMPLES_PER_CATEGORY = 5

  translates :name, :description

  belongs_to :project

  has_many :skills_job_roles
  has_many :job_roles, through: :skills_job_roles
  has_many :skills_development_actions, dependent: :destroy
  has_many :development_actions, through: :skills_development_actions
  has_many :idp_template_skills # added for sample_by_categories being used through template

  enum category: { behavioral: 0, technical: 1, other: 2 }

  acts_as_taggable_on :tags
  acts_as_taggable_tenant :project_id

  # Scopes
  scope :global, ->(_value = nil) { where(project_id: nil) }
  scope :project_id_eq, ->(project_id) { where(project_id: project_id) }
  scope :all_skills, ->(_value = nil) { all }
  # Search entity by word
  scope :search_query, lambda { |query|
    where('name ILIKE ?', "%#{query}%")
  }

  scope :filter_by_category, lambda { |category|
    where(category: Skill.categories[category]) if Skill.categories.key?(category)
  }

  scope :sample_by_categories, lambda {
    from("(#{
      select('skills.*', 'ROW_NUMBER() OVER (PARTITION BY skills.category ORDER BY RANDOM()) as row_num').
      to_sql
    }) as skills").
      where('row_num <= ?', SAMPLES_PER_CATEGORY)
  }

  def self.ransackable_attributes(_auth_object = nil)
    %w[id name category project_id]
  end

  def self.ransackable_associations(_auth_object = nil)
    %w[job_roles project]
  end

  def self.ransackable_scopes(_auth_object = nil)
    %w[all_skills global by_project filter_by_category search_query]
  end

  # Custom ransacker for category enum
  ransacker :category, formatter: proc { |v| categories[v] } do |parent|
    parent.table[:category]
  end
end
