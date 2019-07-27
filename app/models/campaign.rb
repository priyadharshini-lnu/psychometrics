class Campaign < ApplicationRecord
  self.inheritance_column = :_type_disabled

  belongs_to :project, class_name: "Client"
  has_one :threesixty_campaign, class_name: "Threesixty::Campaign", dependent: :destroy
  has_one :datasheet, through: :project
  has_many :relationships, dependent: :destroy
  has_many :subjects, class_name: 'Threesixty::Subject', dependent: :destroy
  has_many :evaluators, class_name: 'Threesixty::Evaluator', dependent: :destroy
  has_many :participants, class_name: 'Threesixty::Participant', dependent: :destroy
  has_many :users_assessments, dependent: :destroy
  has_many :users_reports, dependent: :destroy
  has_many :campaigns_users, dependent: :destroy
  has_many :instruction_templates, -> { enabled }
  has_many :users_results, dependent: :destroy

  THREESIXTY = :threesixty

  enum type: %i[common threesixty]
end
