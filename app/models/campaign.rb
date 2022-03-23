# frozen_string_literal: true

class Campaign < ApplicationRecord
  include RansackSearchableFields

  self.inheritance_column = :_type_disabled

  after_create_commit :ensure_campaign_options
  after_create :set_uniq_code

  belongs_to :project, class_name: 'Client'

  has_one :threesixty_campaign, class_name: 'Threesixty::Campaign', dependent: :destroy
  has_one :threesixty_option, through: :threesixty_campaign, class_name: 'Threesixty::Option', source: :option
  has_one :campaign_options, dependent: :destroy
  has_one :project_datasheet, through: :project, source: :datasheet
  has_one :campaign_datasheet, class_name: 'Datasheet', foreign_key: :campaign_id, dependent: :destroy
  has_one :datasheet_column_preference, as: :resource

  delegate :fixed_time?,
           :fixed_time_duration,
           :time_zone,
           :instructions_enabled,
           :instructions,
           :proctoring_enabled?,
           :identification,
           :rules,
           to: :campaign_options

  has_many :license_usages, inverse_of: :campaign
  has_many :subjects, class_name: 'Threesixty::Subject', dependent: :destroy
  has_many :evaluators, class_name: 'Threesixty::Evaluator', dependent: :destroy
  has_many :participants, class_name: 'Threesixty::Participant', dependent: :destroy
  has_many :user_reports, dependent: :destroy
  has_many :campaign_users, dependent: :destroy
  has_many :instruction_templates, -> { enabled }
  has_many :instruction_templates, -> { enabled }, foreign_key: :threesixty_campaign_id,
                                                     class_name: 'Threesixty::InstructionTemplate'
  has_many :user_assessments, dependent: :destroy
  has_many :users_results, through: :user_assessments, dependent: :destroy
  has_many :campaign_reports, dependent: :destroy
  has_many :reports, through: :campaign_reports
  has_many :campaign_assessments, dependent: :destroy
  has_many :campaign_assessment_groups, dependent: :destroy
  has_many :assessments, through: :campaign_assessments
  has_many :users, through: :campaign_users
  has_many :registration_codes, dependent: :destroy
  has_many :assessors, dependent: :destroy
  has_many :sms_invites
  has_many :sms_records
  has_many :memberships
  has_many :relationships, dependent: :destroy

  accepts_nested_attributes_for :campaign_options

  delegate :client, to: :project
  THREESIXTY = 'threesixty'

  enum type: %i[common threesixty]
  enum status: { active: 0, closed: 1, inactive: 2, archived: 3 }

  ransacker :status, formatter: proc { |v| statuses[v] } do |parent|
    parent.table[:status]
  end

  ransacker :type, formatter: proc { |v| types[v] } do |parent|
    parent.table[:type]
  end

  scope :visible_to_end_user, -> { where(status: %i[active closed]) }
  scope :fixed_time, -> { joins(:campaign_options).where(campaign_options: { fixed_time: true }) }

  def proctoring_license
    client.active_licenses.where(type: :proctoring).first
  end

  def real_status
    return 'closed' if end_date && end_date < Time.now

    status
  end

  def datasheet
    campaign_datasheet || project_datasheet
  end

  def datasheet_data(email)
    ::Campaigns::GetDatasheetData.call!(self, email)[email]
  end

  def datasheet_column_names
    datasheet_columns.keys
  end

  def datasheet_columns
    project_datasheet_columns = project.datasheet&.columns || {}
    campaign_datasheet_columns = datasheet&.columns || {}
    project_datasheet_columns.merge(campaign_datasheet_columns)
  end

  def nomalized_datasheet_columns
    datasheet_columns.map { |k, v| { name: k, type: v } }
  end

  def assessor_assessments
    Assessment.assessor_form.joins(:user_assessments).
      where(user_assessments: { campaign_id: id, relationship_id: Relationship.assessor_relationship.id }).uniq
  end

  def clone
    deep_clone(include: %i[
                 campaign_reports campaign_assessments campaign_assessment_groups campaign_options
               ])
  end

  def timed?
    fixed_timed? || end_date?
  end

  def fixed_timed?
    fixed_time? && fixed_time_duration.present?
  end

  def log_attribute_for_delete
    slice(:name, :project_id)
  end

  private

  def ensure_campaign_options
    return if campaign_options.present?

    create_campaign_options!
  end

  def set_uniq_code
    self.uniq_code = [
      ENV['SERVER_NAME'],
      project.id,
      id
    ].compact.join('-')
    save!
  end
end
