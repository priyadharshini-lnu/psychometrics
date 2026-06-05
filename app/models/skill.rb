# frozen_string_literal: true

class Skill < ApplicationRecord
  extend Mobility
  include Taggable
  include RansackSearchableFields
  include VectorEmbeddable

  SAMPLES_PER_SKILL_TYPE = 5

  translates :name, :description, dirty: true

  belongs_to :project
  belongs_to :skill_group, optional: true
  include Tenantable

  has_one :proficiency_level
  has_one :question, dependent: :destroy
  has_one :factor, dependent: :destroy
  has_many :skills_job_roles
  has_many :job_roles, through: :skills_job_roles
  has_many :skills_development_actions, dependent: :destroy
  has_many :development_actions, through: :skills_development_actions
  has_many :idp_template_skills # added for sample_by_skill_types being used through template

  validates :name, presence: true, uniqueness: { scope: :project_id, case_sensitive: false }

  enum :skill_type, { behavioral: 0, technical: 1, other: 2, qualification: 3 }

  after_create_commit :create_associated_entities

  acts_as_taggable_on :tags
  acts_as_taggable_tenant :project_id

  # Scopes
  scope :global, ->(_value = nil) { where(project_id: nil) }
  scope :project_id_eq, ->(project_id) { where(project_id: project_id) }
  scope :all_skills, ->(_value = nil) { all }

  scope :filter_by_skill_type, lambda { |skill_type|
    where(skill_type: ::Skill.skill_types[skill_type]) if ::Skill.skill_types.key?(skill_type)
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

  scope :available_skills_by_plan_id, lambda { |plan_id|
    Idp::IdpPlan::AvailableSkillsQuery.new(
      UserIdpPlan.find(plan_id)
    ).query
  }

  scope :excluding_plan, lambda { |plan_id: nil|
    plan_id.nil? ? all : where.not(id: UserIdpSkill.not_deleted.where(user_idp_plan_id: plan_id).select(:skill_id))
  }

  def self.ransackable_attributes(_auth_object = nil)
    %w[id name skill_type project_id]
  end

  def self.ransackable_associations(_auth_object = nil)
    %w[job_roles project]
  end

  def self.ransackable_scopes(_auth_object = nil)
    %w[all_skills global by_project filter_by_skill_type filterable_fields by_idp_template_id
       available_skills_by_plan_id]
  end

  # Custom ransacker for skill_type enum
  ransacker :skill_type, formatter: proc { |v| skill_types[v] } do |parent|
    parent.table[:skill_type]
  end

  def embedding_text
    parts = []

    if name.present?
      parts << "Name: #{name}"
    end

    if description.present?
      # Maximum of 200 words from description for embedding text
      trimmed_description = description.split.first(200).join(' ')

      parts << "Description: #{trimmed_description}"
    end

    parts << "Type: #{skill_type.humanize}" if skill_type.present?

    if skill_group.present?
      parts << "Group: #{skill_group.name}"
    end

    if tag_list.any?
      parts << "Tags: #{tag_list.join(', ')}"
    end

    parts.join('. ')
  end

  private

  def embedding_text_previously_changed?
    return true if saved_change_to_id?

    saved_change_to_name? ||
      saved_change_to_description? ||
      saved_change_to_skill_type? ||
      saved_change_to_skill_group_id?
  end

  def create_associated_entities
    Skills::CreateSkillFactorAndQuestion.call(self)
  end
end
