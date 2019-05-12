class Campaign < ApplicationRecord
  self.inheritance_column = :_type_disabled

  belongs_to :project, class_name: "Client"
  has_one :threesixty_campaign, class_name: "Threesixty::Campaign", dependent: :destroy
  has_many :relationships
  has_many :subjects, class_name: 'Threesixty::Subject'
  has_many :evaluators, class_name: 'Threesixty::Evaluator'
  has_many :participants
  has_many :subjects_releationships, class_name: "Threesixty::SubjectsRelationship"
  has_many :subjects
  has_many :evaluators
  has_many :participants
  has_many :campaigns_users

  THREESIXTY = :threesixty

  enum type: %i[common threesixty]
end
