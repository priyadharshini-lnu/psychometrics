# frozen_string_literal: true

class Skill < ApplicationRecord
  extend Mobility
  include Taggable
  include RansackSearchableFields

  SAMPLES_PER_SKILL_TYPE = 5

  translates :name, :description

  belongs_to :project
  belongs_to :skill_group, optional: true

  has_one :proficiency_level
  has_one :question, dependent: :destroy
  has_one :factor, dependent: :destroy
  has_many :skills_job_roles
  has_many :job_roles, through: :skills_job_roles
  has_many :skills_development_actions, dependent: :destroy
  has_many :development_actions, through: :skills_development_actions
  has_many :idp_template_skills # added for sample_by_skill_types being used through template

  validates :name, presence: true, uniqueness: { scope: :project_id, case_sensitive: false }

  enum :skill_type, { behavioral: 0, technical: 1, other: 2 }

  after_create_commit :create_associated_question, unless: :question_exists?

  acts_as_taggable_on :tags
  acts_as_taggable_tenant :project_id

  # Scopes
  scope :global, ->(_value = nil) { where(project_id: nil) }
  scope :project_id_eq, ->(project_id) { where(project_id: project_id) }
  scope :all_skills, ->(_value = nil) { all }

  scope :filter_by_skill_type, lambda { |skill_type|
    where(skill_type: Skill.skill_types[skill_type]) if Skill.skill_types.key?(skill_type)
  }

  scope :sample_by_skill_types, lambda {
    from("(#{
      select('skills.*', 'ROW_NUMBER() OVER (PARTITION BY skills.skill_type ORDER BY RANDOM()) as row_num').
      to_sql
    }) as skills").
      where('row_num <= ?', SAMPLES_PER_SKILL_TYPE)
  }

  scope :by_idp_template_id, lambda { |idp_template_id|
    IdpTemplate.includes(:project, :skills).find_by(id: idp_template_id)&.available_skills || Skill.none
  }

  def self.ransackable_attributes(_auth_object = nil)
    %w[id name skill_type project_id]
  end

  def self.ransackable_associations(_auth_object = nil)
    %w[job_roles project]
  end

  def self.ransackable_scopes(_auth_object = nil)
    %w[all_skills global by_project filter_by_skill_type filterable_fields by_idp_template_id]
  end

  # Custom ransacker for skill_type enum
  ransacker :skill_type, formatter: proc { |v| skill_types[v] } do |parent|
    parent.table[:skill_type]
  end

  private

  def create_associated_question
    Question.create!(
      name: "#{name} Question",
      skill: self,
      owner_id: project_id,
      type: 'SkillsRater'
    )
  end

  def question_exists?
    Question.exists?(skill_id: id)
  end
end
