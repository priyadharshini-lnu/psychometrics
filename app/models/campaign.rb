# frozen_string_literal: true

class Campaign < ApplicationRecord
  include GeoFilterable

  audited except: %i[encrypted_pdf_password encrypted_pdf_password_iv]

  include RansackSearchableFields

  self.inheritance_column = :_type_disabled

  attr_encrypted :pdf_password, key: Base64.decode64(Settings.secrets.encrypted_key.to_s)

  before_create -> { self.pdf_password = SecureRandom.hex }
  after_create_commit :ensure_campaign_options
  after_create :set_uniq_code

  belongs_to :project, class_name: 'Client'
  belongs_to :default_idp_template, class_name: 'IdpTemplate', optional: true

  has_one :threesixty_campaign, class_name: 'Threesixty::Campaign', dependent: :destroy
  has_one :threesixty_option, through: :threesixty_campaign, class_name: 'Threesixty::Option', source: :option
  has_one :campaign_options, dependent: :destroy
  has_one :accesssheet, dependent: :destroy
  has_one :project_datasheet, through: :project, source: :datasheet
  has_one :campaign_datasheet, class_name: 'Datasheet', dependent: :destroy
  has_one :dashboard
  has_one :campaign_idp
  has_one :campaign_template, dependent: :destroy

  has_many :sheets, dependent: :destroy
  has_many :workshops, dependent: :destroy
  has_many :workshop_assessors, through: :workshops
  has_many :workshop_invites
  has_many :workshop_invited_subjects, through: :workshop_invites, source: :workshop_invited_subjects
  has_many :workshop_subjects, dependent: :destroy
  has_many :campaign_assessor_assessments, dependent: :destroy
  has_many :campaign_factor_groups, dependent: :destroy
  has_many :campaign_factors, dependent: :destroy
  has_many :campaign_factor_values, dependent: :destroy
  has_many :campaign_assessor_assessment_factor_weights, dependent: :destroy
  has_many :factor_benchmark_scores, dependent: :destroy
  has_many :campaign_ai_artifacts, class_name: 'AI::CampaignArtifact', dependent: :destroy

  delegate :fixed_time?,
           :fixed_time,
           :fixed_time_duration,
           :time_zone,
           :instructions_enabled,
           :instructions,
           :proctoring_enabled?,
           :proctoring_enabled_on_workshop_activity?,
           :identification,
           :rules,
           :campaign_scoring_variables,
           :proctoring_type,
           to: :campaign_options
  delegate :skill_rater?, to: :threesixty_campaign, allow_nil: true

  has_many :license_usages, inverse_of: :campaign
  has_many :subjects, class_name: 'Threesixty::Subject', dependent: :destroy
  has_many :evaluators, class_name: 'Threesixty::Evaluator', dependent: :destroy
  has_many :participants, class_name: 'Threesixty::Participant', dependent: :destroy
  has_many :user_reports, dependent: :destroy
  has_many :campaign_users, dependent: :destroy
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
  has_many :sms_invites, dependent: :destroy
  has_many :sms_records, dependent: :destroy
  has_many :memberships
  has_many :relationships, dependent: :destroy
  has_many :report_approval_settings, dependent: :destroy
  has_many :report_approvals, dependent: :destroy
  has_many :communications, dependent: :destroy
  has_many :user_idp_plans

  accepts_nested_attributes_for :campaign_options

  delegate :client, to: :project
  THREESIXTY = 'threesixty'

  enum :type, { common: 0, threesixty: 1 }
  enum :status, { active: 0, closed: 1, inactive: 2, archived: 3 }

  ransacker :status, formatter: proc { |v| statuses[v] } do |parent|
    parent.table[:status]
  end

  ransacker :type do |parent|
    parent.table[:type]
  end

  scope :visible_to_end_user, lambda {
    where(
      'campaigns.status IN (?) OR (campaigns.status = ? AND campaigns.start_date is NOT NULL)',
      [statuses[:active], statuses[:closed]],
      statuses[:inactive]
    )
  }
  scope :fixed_time, -> { joins(:campaign_options).where(campaign_options: { fixed_time: true }) }

  scope :templates, -> { where(is_template: true) }
  scope :not_templates, -> { where(is_template: false) }

  def self.scoped_by_client(restricted_client_subquery)
    return all if restricted_client_subquery.blank?

    joins(:project).
      where.not(clients: { tte_id: restricted_client_subquery })
  end

  def self.ransackable_attributes(_auth_object = nil)
    %w[id name status type start_date end_date]
  end

  def real_status
    return 'closed' if end_date && end_date < Time.zone.now

    status
  end

  def datasheet
    campaign_datasheet || project_datasheet
  end

  def datasheet_data(email)
    ::Campaigns::GetDatasheetData.call!(self, email)[email]
  end

  def datasheet_column_names
    datasheet_columns.pluck('name')
  end

  def datasheet_columns
    datasheet_column_records.map { |c| { 'name' => c.name, 'type' => c.humanize_type } }
  end

  def datasheet_column_records
    project_datasheet_columns = project.datasheet&.sheet_columns.to_a
    campaign_datasheet_columns = datasheet&.sheet_columns.to_a
    column_names = (project_datasheet_columns + campaign_datasheet_columns).map(&:name).uniq
    column_names.map do |column_name|
      campaign_column = campaign_datasheet_columns.find { |dc| dc.name == column_name }
      campaign_column || project_datasheet_columns.find { |dc| dc.name == column_name }
    end
  end

  def assessor_assessments
    assessor_assessment_ids = campaign_assessor_assessments.select(:assessment_id)
    Assessment.assessor_form.joins(:user_assessments).
      where(
        user_assessments: { campaign_id: id, relationship_id: Relationship.assessor_relationship.id }
      ).where.not(id: assessor_assessment_ids).uniq
  end

  def lead_assessor_assessment
    campaign_assessor_assessments.joins(:assessment).
      find_by(assessment: { category: Assessment::CATEGORIES[:lead_assessor_form] })&.assessment
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

  def active_workshop
    workshops.
      includes(:workshop_subjects).
      joins(:workshop_subjects).
      merge(WorkshopSubject.participatable).
      first
  end

  def template?
    is_template
  end

  private

  def ensure_campaign_options
    return if campaign_options.present?

    create_campaign_options!
  end

  def set_uniq_code
    self.uniq_code = [
      ENV.fetch('SERVER_NAME', nil),
      project.id,
      id
    ].compact.join('-')
    save!
  end
end
