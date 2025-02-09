# frozen_string_literal: true

class IdpTemplate < ApplicationRecord
  include RansackSearchableFields

  belongs_to :project, class_name: 'Client'
  belongs_to :report
  has_many :idp_template_skills, dependent: :destroy

  has_many :idp_template_development_actions, dependent: :destroy
  has_many :skills, through: :idp_template_skills, dependent: :destroy
  has_many :development_actions, through: :idp_template_development_actions, dependent: :destroy

  enum available_development_actions_selection_type: { none: 0, all: 1, selected: 2 },
       _prefix: :available_development_actions
  enum suggested_development_actions_selection_type: { none: 0, all: 1, selected: 2 },
       _prefix: :suggested_development_actions

  store_accessor :skill_settings, %i[behavioral_global behavioral_client], suffix: true
  store_accessor :skill_settings, %i[technical_global technical_client], suffix: true

  VALID_SKILL_SETTINGS = %w[none all selected].freeze

  validates :behavioral_global_skill_settings, inclusion: VALID_SKILL_SETTINGS, allow_blank: true
  validates :behavioral_client_skill_settings, inclusion: VALID_SKILL_SETTINGS, allow_blank: true
  validates :technical_global_skill_settings, inclusion: VALID_SKILL_SETTINGS, allow_blank: true
  validates :technical_client_skill_settings, inclusion: VALID_SKILL_SETTINGS, allow_blank: true

  validate :skills_must_be_present_if_selected

  def self.ransackable_attributes(_auth_object = nil)
    %w[id name]
  end

  private

  def skills_must_be_present_if_selected
    if [behavioral_global_skill_settings, behavioral_client_skill_settings, technical_global_skill_settings,
        technical_client_skill_settings].include?('selected') && skills.empty?
      errors.add(:skills, 'must be present if any skill setting is selected')
    end
  end
end
