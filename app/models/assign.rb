# frozen_string_literal: true

# == Schema Information
#
# Table name: assigns
#
#  id                :integer          not null, primary key
#  assessment_id     :integer          not null
#  results           :jsonb
#  scoring           :jsonb
#  embedded_data     :jsonb
#  status            :integer          default("not_started")
#  role              :integer          default("member")
#  completed_at      :datetime
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#  step              :integer
#  membership_id     :integer          not null
#  norm_data         :jsonb
#  started_at        :datetime
#  agile_scoring     :jsonb
#  project_assign_id :integer
#  mindmill_prefix   :string
#  expiry_date       :datetime
#
class Assign < ApplicationRecord
  include EncodableId

  belongs_to :assessment
  belongs_to :membership, inverse_of: :assigns
  belongs_to :evaluator, class_name: 'User'
  belongs_to :subject, class_name: 'User'
  belongs_to :campaign
  has_one :agile, through: :assessment
  has_many :agile_events, dependent: :destroy
  has_one :user, through: :membership
  belongs_to :project_assign, foreign_key: :project_assign_id, class_name: 'Assign'
  has_one :original_assign, foreign_key: :project_assign_id, class_name: 'Assign'
  has_many :original_assigns, foreign_key: :project_assign_id, class_name: 'Assign'
  has_many :assigns_reports, inverse_of: :assign # on delete cascade
  has_many :access_assigns_reports,
           -> { where(user_access: true) },
           foreign_key: :assign_id,
           inverse_of: :assign,
           class_name: 'AssignsReport'
  has_many :original_assigns_reports,
           -> { distinct },
           through: :original_assigns,
           source: :access_assigns_reports
  has_many :enabled_assigns_reports, -> { active }, class_name: 'AssignsReport'
  has_many :reports, through: :assigns_reports, dependent: :destroy
  has_many :multiple_reports, -> { multiple }, through: :assigns_reports, source: :report
  has_many :single_reports, -> { single }, through: :assigns_reports, source: :report
  has_many :media_responses, dependent: :destroy

  validates_uniqueness_of :assessment_id, scope: [:membership_id], message: :not_uniqueness
  validates :membership, :assessment, presence: true

  validate :relevant_membership, if: -> { membership.present? }
  validate :relevant_reports, if: -> { report_ids.any? }

  enum status: %i[not_started in_progress completed interrupted]
  enum role: %i[member manager admin]

  scope :mindmill, lambda {
    joins(:assessment).
      where.has { |assigns| assigns.assessment.type.eq(Assessment::TYPES[:mindmill]) }
  }
  scope :projects, -> { where(project_assign_id: nil) }
  scope :originals, -> { where.not(project_assign_id: nil) }
  scope :with_status, lambda { |status|
    joining { project_assign.outer }.
      where.has do |s|
      (s.project_assign.status == statuses[status]) |
        ((s.project_assign.id == nil) & (s.status == statuses[status]))
    end
  }
  scope :agile, lambda {
    joins(:assessment).where.has { |assigns| assigns.assessment.category.eq(Assessment::CATEGORIES[:agile]) }
  }
  scope :complete, lambda {
    where(status: 'completed')
  }

  attribute :user_access, :boolean, default: false

  after_initialize :init
  after_create :set_project_assign
  before_save :notification_handler
  before_create :set_mindmill_prefix
  before_update :set_started_at, if: proc { will_save_change_to_status? && in_progress? }
  before_update :set_expiry_date, if: proc { will_save_change_to_status? && in_progress? && !expiry_date }
  before_update :set_last_activity_at, if: proc { will_save_change_to_status? && in_progress? }
  after_destroy :clear_project_assign
  after_update_commit ::Callbacks::Models::Assigns::UpdateResultByParent.new
  after_update_commit ::Callbacks::Models::Assigns::UpdateStartedAtByParent.new
  after_update_commit ::Callbacks::Models::Assigns::UpdateCompletedAtByParent.new

  after_commit :send_completion_email, if: proc { status_previously_changed? && completed? }
  after_commit :update_membership_completed

  delegate :project_membership, to: :membership
  delegate :threesixty?, to: :assessment

  def set_started_at
    self.started_at = DateTime.current
    self.step = 0
  end

  def set_expiry_date
    time = status_in_database == 'interrupted' ? additional_time : assessment.extra['timer']
    self.expiry_date = time.second&.from_now if time
  end

  def set_last_activity_at
    self.last_activity_at = DateTime.current
  end

  def init
    self.status ||= Assign.statuses['not_started'] if respond_to? :status
    self.step ||= 0 if respond_to? :step
    self.scoring ||= {} if respond_to? :scoring
    self.agile_scoring ||= {} if respond_to? :agile_scoring
  end

  mount_base64_uploader :mindmill_report, PrivateFileUploader, file_name: proc { 'mindmill_report' }

  def notification_handler
    if will_save_change_to_status?
      if in_progress?
        Notification.create(
          assessment_id: assessment_id,
          membership_id: membership_id,
          text: I18n.t('assigns.notifications.in_progress',
                       user_name: user.decorate.display_name,
                       assessment_name: assessment.name)
        )
      end
      if completed?
        Notification.create(
          assessment_id: assessment_id,
          membership_id: membership_id,
          text: I18n.t('assigns.notifications.completed',
                       user_name: user.decorate.display_name,
                       assessment_name: assessment.name)
        )
      end
    end
  end

  def encode_id
    self.class.encode_id id
  end

  def norm_type
    return norm_data['type'] if norm_data && norm_data['id'] && norm_data['type']

    nil
  end

  def norm_id
    norm_data&.dig('id')&.to_i
  end

  def assign_with_result
    project_assign || self
  end

  def original_or_self
    original_assign || self
  end

  def project_id
    assign_with_result.membership.client_id
  end

  def threesixty_subject
    Threesixty::Subject.find_by(user_id: subject_id, campaign_id: campaign_id)
  end

  def expired?
    return false unless expiry_date

    expiry_date < Time.current
  end

  def extra_time_buffer_expired?
    return false unless expiry_date

    expiry_date.advance(minutes: 5) < Time.current
  end

  def answer_key
    'results'
  end

  def answers
    results
  end

  private

  def send_completion_email
    assign = original_assign || self
    ::Communications::CompletionTypeJob.perform_later(assign)
  end

  def update_membership_completed
    return if project_membership.nil? || membership.destroyed?

    assigns = membership.reload.assigns
    completed = assigns.size.positive? && assigns.size == assigns.completed.size
    membership.update_column(:assigns_completed, completed)
  end

  # TODO: (atanych): should be refactored
  def set_project_assign
    return if project_membership.nil?

    project_assign = project_membership.assigns.where(assessment_id: assessment_id).take
    unless project_assign
      project_assign = dup
      project_assign.membership_id = project_membership.id
      project_assign.save!
    end
    update_column(:project_assign_id, project_assign.id)
  end

  def set_mindmill_prefix
    self.mindmill_prefix = Settings.assigns.mindmill_prefix if assessment.type.eql?(Assessment::TYPES[:mindmill])
  end

  def clear_project_assign
    return if project_assign.nil? || project_membership.clients_assigns.pluck('assigns.assessment_id').
              include?(assessment_id)

    project_assign.destroy!
  end

  def relevant_membership
    errors.add(:membership) if membership.scope == :administration
  end

  def relevant_reports
    if (membership.client.report_ids & assessment.report_ids & report_ids).to_set != report_ids.to_set
      errors.add(:reports)
    end
  end
end
