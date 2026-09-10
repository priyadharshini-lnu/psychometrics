# frozen_string_literal: true

# rubocop:disable Metrics/ClassLength

class UserIdpPlan < ApplicationRecord
  include WorkflowActiverecord
  include ActiveStorageAttachable
  include SafeVersionReification

  has_paper_trail if: proc { |plan|
    (plan.approval_status_changed? &&
      %w[approved pending_approval rejected].include?(plan.approval_status)) ||
      %w[pending_approval in_review draft].include?(plan.approval_status)
  }

  filtered_associations :public_user_idp_skills, :public_user_idp_development_actions,
                        :public_skills, :public_development_actions

  belongs_to :user
  belongs_to :campaign
  belongs_to :idp_template
  belongs_to :creator, class_name: 'User'
  include Tenantable

  has_many :user_idp_skills, autosave: true, dependent: :destroy
  has_many :skills, through: :user_idp_skills
  has_many :user_idp_development_actions, autosave: true, dependent: :destroy
  has_many :development_actions, through: :user_idp_development_actions
  has_many :public_user_idp_skills, -> { where(private: false) }, class_name: 'UserIdpSkill'
  has_many :public_user_idp_development_actions, -> { with_public_skills }, class_name: 'UserIdpDevelopmentAction'
  has_many :public_skills, -> { where(user_idp_skills: { private: false }) }, through: :user_idp_skills, source: :skill
  has_many :public_development_actions, lambda {
    where(user_idp_development_actions: { private: false })
  }, through: :user_idp_development_actions, source: :development_action
  has_many :custom_development_actions, lambda {
    where(source_type: :custom)
  }, class_name: 'DevelopmentAction', as: :owner, dependent: :destroy
  has_many :idp_template_skills, through: :idp_template
  has_many :communication_email_resources, as: :resource
  has_many :communication_emails, through: :communication_email_resources
  has_one :license_usage, as: :consumer
  has_many :idp_report_pdfs, dependent: :destroy
  has_many :user_idp_comments, dependent: :destroy
  has_many :reflection_questions, through: :idp_template
  has_many :idp_template_reflection_questions, through: :idp_template
  has_many :user_reflection_question_answers, dependent: :destroy
  has_one :ai_assisted_idp_session,
          -> { where(type: 'AI::AssistedUserIdpSession') },
          as: :assistable,
          class_name: 'AI::AssistedUserIdpSession',
          dependent: :destroy

  delegate :client, to: :campaign
  delegate :project, to: :campaign

  has_one_attachment :user_document,
                     service: Settings.storage.private_storage_service,
                     content_type: %w[application/pdf]

  validates :user_document, size: { less_than: 5.megabytes }, if: -> { user_document.attached? }

  enum :approval_status,
       {
         not_started: 0,
         draft: 1,
         pending_approval: 2,
         in_review: 3,
         approved: 4,
         rejected: 5,
         ai_assisted_idp_in_progress: 6
       }

  enum :completion_status,
       {
         not_started: 0,
         in_progress: 1,
         completed: 2
       }, prefix: true

  scope :active, -> { where(active: true) }

  after_create :schedule_idp_assigned_notification
  after_update :update_completed_at_or_started_at, if: :saved_change_to_completion_status?

  alias report_pdfs idp_report_pdfs

  workflow_column :approval_status

  workflow do # rubocop:disable Metrics/BlockLength
    state :not_started do
      event :draft, transitions_to: :draft
      event :start_ai_assistance, transitions_to: :ai_assisted_idp_in_progress
    end
    state :draft do
      event :submit_for_approval, transitions_to: :pending_approval
      event :approve, transitions_to: :approved, unless: ->(ua) { ua.manager_approval_required? }
      event :not_started, transitions_to: :not_started
    end
    state :pending_approval do
      event :draft, transitions_to: :draft
      event :start_review, transitions_to: :in_review
    end
    state :rejected do
      event :draft, transitions_to: :draft
      event :approve, transition_to: :approved
      event :submit_for_approval, transitions_to: :pending_approval
    end
    state :in_review do
      event :approve, transitions_to: :approved
      event :reject, transitions_to: :rejected
    end
    state :approved do
      event :draft, transitions_to: :draft, if: ->(ua) { ua.completion_status != 'completed' }
    end
    state :ai_assisted_idp_in_progress do
      event :draft, transitions_to: :draft
    end

    on_transition do |_from, to, _event, note = nil, *_|
      if to == :approved
        update(last_approved_at: Time.current, review_note: note)
        destroy_soft_deleted_skills_and_actions
      end
      update(review_note: note) if to == :rejected
      schedule_idp_status_notification(to) if %i[approved rejected].include?(to)
    end

    after_transition do |_from, _to, _event, *_|
      paper_trail.save_with_version
    end
  end

  def destroy_soft_deleted_skills_and_actions
    user_idp_skills.deleted.destroy_all
    user_idp_development_actions.deleted.destroy_all
  end

  def details_to_log
    {
      user_email: user.email,
      user_name: user.decorate.full_name
    }
  end

  def status
    if (!completion_status_not_started? && approved?) || ai_assisted_idp_in_progress?
      completion_status
    else
      approval_status
    end
  end

  def unread_comments_count_by(user)
    user_idp_comments.unread_by_user(user).count
  end

  def manager_approval_required?
    project.idp_setting.manager_approves_idp && user.manager.present?
  end

  def campaign_user
    CampaignUser.find_by(campaign_id: campaign_id, user_id: user_id)
  end

  def default_language
    campaign.project.available_locales.first || I18n.default_locale
  end

  def skill_gap_report
    idp_template.report
  end

  def user_skill_gap_report
    user.user_reports.find_by(
      campaign_id: campaign_id,
      report_id: idp_template.report_id
    )&.user_report_pdf
  end

  def report_name_for_download
    "#{user.email}_idp_report_#{user.id}.pdf"
  end

  def report_pdf(locale: nil, include_reflective_questions: false)
    report_pdfs.find_by(locale: locale, include_reflective_questions: include_reflective_questions)
  end

  def pdf_path(locale: nil, include_reflective_questions: false)
    report_pdf(locale: locale, include_reflective_questions: include_reflective_questions)&.pdf_file&.key
  end

  def pdf_url(locale: nil, include_reflective_questions: false, expires_in: 10.minutes)
    report_pdf(locale: locale,
               include_reflective_questions: include_reflective_questions)&.pdf_file&.url(expires_in: expires_in)
  end

  def editable?
    draft? || rejected? || not_started?
  end

  def manager_editable?
    in_review?
  end

  def can_revert_to_last_approved
    versions.where( # rubocop:disable Rails/WhereExists
      "versions.object ->> 'approval_status' IN (?)", %w[approved]
    ).exists? && (draft? || rejected?)
  end

  def pre_submission?
    (draft? || not_started?) && !versions.where( # rubocop:disable Rails/WhereExists
      "versions.object ->> 'approval_status' IN (?)", %w[approved rejected]
    ).exists?
  end

  def attachment_storage_path(attribute_name, filename)
    "private/projects/#{campaign.project_id}/user_idp_plans/#{id}/#{attribute_name}/#{filename}"
  end

  def pending_initial_review
    return false unless pending_approval?

    versions.where("object->>'approval_status' IN (?)", %w[in_review rejected approved]).none?
  end

  private

  def update_completed_at_or_started_at
    return unless completion_status_completed? || completion_status_in_progress?

    if completion_status_completed?
      update_column(:completed_at, Time.current)
    elsif completion_status_in_progress?
      update_column(:started_at, Time.current)
    end
  end

  def schedule_idp_assigned_notification
    schedule_idp_notification('idp_template_assigned')
  end

  def schedule_idp_status_notification(status)
    notification_kind = if status == :approved
                          'idp_template_approved'
                        elsif status == :rejected
                          'idp_template_rejected'
                        end
    return unless notification_kind

    schedule_idp_notification(notification_kind)
  end

  def schedule_idp_notification(kind)
    schedule_legacy_idp_notification(kind) unless legacy_idp_notification_sent?(kind)
    schedule_delivery_idp_notification(kind) unless delivery_idp_notification_sent?(kind)
  end

  def legacy_idp_notification_sent?(kind)
    communication_emails.joins(:communication).exists?(communications: { kind: kind })
  end

  def delivery_idp_notification_sent?(kind)
    communication_emails.joins(communication_delivery: :communication_template).
      exists?(communication_templates: { kind: kind })
  end

  def schedule_legacy_idp_notification(kind)
    communication = Communication.order(:created_at).where(kind: kind, campaign_id: campaign_id).last
    return unless communication

    communication.create_communication_email_with_resources({ user: user, campaign_user: campaign_user }, self)
  end

  def schedule_delivery_idp_notification(kind)
    delivery = CommunicationDelivery.active_for_kind(kind, campaign_id: campaign_id, project_id: campaign.project_id)
    return unless delivery

    CommunicationEmail.create_with_resources(
      { communication_delivery_id: delivery.id, user: user, campaign_user: campaign_user }, self
    )
  end
end

# rubocop:enable Metrics/ClassLength
