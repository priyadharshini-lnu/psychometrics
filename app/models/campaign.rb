# frozen_string_literal: true

class Campaign < ApplicationRecord
  include RansackSearchableFields

  self.inheritance_column = :_type_disabled

  belongs_to :project, class_name: 'Client'
  has_one :threesixty_campaign, class_name: 'Threesixty::Campaign', dependent: :destroy
  has_one :threesixty_option, through: :threesixty_campaign, class_name: 'Threesixty::Option', source: :option
  has_one :datasheet, through: :project
  has_many :relationships, dependent: :destroy
  has_many :license_usages, inverse_of: :campaign
  has_many :subjects, class_name: 'Threesixty::Subject', dependent: :restrict_with_error
  has_many :evaluators, class_name: 'Threesixty::Evaluator', dependent: :restrict_with_error
  has_many :participants, class_name: 'Threesixty::Participant', dependent: :restrict_with_error
  has_many :campaigns_users_reports, dependent: :destroy
  has_many :campaigns_users, dependent: :destroy
  has_many :instruction_templates, -> { enabled }
  has_many :users_results, dependent: :destroy
  has_many :campaigns_reports
  has_many :reports, through: :campaigns_reports
  has_many :campaigns_assessments
  has_many :assessments, through: :campaigns_assessments

  delegate :client, to: :project
  THREESIXTY = 'threesixty'

  enum type: %i[common threesixty]
  enum status: { active: 0, closed: 1 }

  ransacker :status, formatter: proc { |v| statuses[v] } do |parent|
    parent.table[:status]
  end

  def can_destroy?
    [subjects.exists?, evaluators.exists?, participants.exists?].none?
  end
end
