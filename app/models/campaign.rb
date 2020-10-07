# frozen_string_literal: true

class Campaign < ApplicationRecord
  include RansackSearchableFields

  self.inheritance_column = :_type_disabled

  after_create_commit :ensure_campaign_options

  belongs_to :project, class_name: 'Client'

  has_one :threesixty_campaign, class_name: 'Threesixty::Campaign', dependent: :destroy
  has_one :threesixty_option, through: :threesixty_campaign, class_name: 'Threesixty::Option', source: :option
  has_one :datasheet, through: :project
  has_one :campaign_options, dependent: :destroy
  delegate :fixed_time?, :fixed_time_duration, :time_zone, :instructions_enabled, :instructions, to: :campaign_options

  has_many :relationships, dependent: :destroy
  has_many :license_usages, inverse_of: :campaign
  has_many :subjects, class_name: 'Threesixty::Subject', dependent: :restrict_with_error
  has_many :evaluators, class_name: 'Threesixty::Evaluator', dependent: :restrict_with_error
  has_many :participants, class_name: 'Threesixty::Participant', dependent: :restrict_with_error
  has_many :user_reports, dependent: :destroy
  has_many :campaign_users, dependent: :destroy
  has_many :instruction_templates, -> { enabled }
  has_many :instruction_templates, -> { enabled }, foreign_key: :threesixty_campaign_id,
                                                     class_name: 'Threesixty::InstructionTemplate'
  has_many :user_assessments, dependent: :destroy
  has_many :users_results, dependent: :destroy
  has_many :campaign_reports, dependent: :destroy
  has_many :reports, through: :campaign_reports
  has_many :campaign_assessments, dependent: :destroy
  has_many :campaign_assessment_groups, dependent: :destroy
  has_many :assessments, through: :campaign_assessments
  has_many :users, through: :campaign_users
  has_many :registration_codes, dependent: :destroy

  delegate :client, to: :project
  THREESIXTY = 'threesixty'

  enum type: %i[common threesixty]
  enum status: { active: 0, closed: 1, inactive: 2, archived: 3 }

  ransacker :status, formatter: proc { |v| statuses[v] } do |parent|
    parent.table[:status]
  end

  scope :visible_to_end_user, -> { where(status: %i[active closed]) }

  private

  def ensure_campaign_options
    return if campaign_options.present?

    create_campaign_options!
  end
end
