# frozen_string_literal: true

class IdpTemplate < ApplicationRecord
  belongs_to :owner
  has_many :idp_template_skills, dependent: :destroy
  has_many :idp_template_development_actions, dependent: :destroy
  has_many :skills, through: :idp_template_skills, dependent: :destroy
  has_many :development_actions, through: :idp_template_development_actions, dependent: :destroy

  enum available_skills_selection_type: { none: 0, all: 1, selected: 2 }, _prefix: :available_skills
  enum available_development_actions_selection_type: { none: 0, all: 1, selected: 2 },
       _prefix: :available_development_actions
  enum suggested_development_actions_selection_type: { none: 0, all: 1, selected: 2 },
       _prefix: :suggested_development_actions
end
