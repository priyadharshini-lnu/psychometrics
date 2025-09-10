# frozen_string_literal: true

class UserIdpPlan < ApplicationRecord
  include WorkflowActiverecord
  include ActiveStorageAttachable

  belongs_to :user
  belongs_to :campaign
  belongs_to :idp_template
  belongs_to :creator, class_name: 'User'
  has_many :user_idp_skills, dependent: :destroy
  has_many :skills, through: :user_idp_skills
  has_many :user_idp_development_actions, dependent: :destroy
  has_many :development_actions, through: :user_idp_development_actions
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
          class_name: 'AI::AssistedUserIdpSession'

  delegate :client, to: :campaign
  delegate :project, to: :campaign

  has_one_attachment :user_document,
                     service: Settings.storage.private_storage_service,
                     content_type: %w[application/pdf]

  enum :status,
       { not_started: 0, draft: 1, pending_approval: 2, approved: 3, rejected: 4, in_progress: 5, completed: 6 }

  scope :active, -> { where(active: true) }

  after_create :schedule_idp_assigned_notification
  after_commit :schedule_idp_status_notification,
               if: proc { saved_change_to_status? && (approved? || rejected?) },
               on: [:update]

  alias report_pdfs idp_report_pdfs

  workflow_column :status

  workflow do # rubocop:disable Metrics/BlockLength
    state :draft do
      event :submit_for_approval, transitions_to: :pending_approval
      event :approve, transitions_to: :approved
      event :start, transitions_to: :in_progress
    end
    state :pending_approval do
      event :approve, transitions_to: :approved
      event :reject, transitions_to: :rejected
    end
    state :approved do
      event :start, transitions_to: :in_progress
      event :reject, transitions_to: :rejected
    end
    state :rejected do
      event :submit_for_approval, transitions_to: :pending_approval
      event :approve, transitions_to: :approved
    end
    state :in_progress do
      event :complete, transitions_to: :completed
    end
    state :completed
    state :not_started do
      event :draft, transitions_to: :draft
    end

    on_transition do |_from, to, _event, *_|
      update(completed_at: Time.current) if to == :completed
      update(started_at: Time.current) if to == :in_progress
    end
  end # rubocop:enable Metrics/BlockLength

  def details_to_log
    {
      user_email: user.email,
      user_name: user.decorate.full_name
    }
  end

  def unread_comments_count_by(user)
    user_idp_comments.unread_by_user(user).count
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
    not_started? || draft? || rejected?
  end

  def manager_editable?
    rejected? || pending_approval?
  end

  def attachment_storage_path(attribute_name, filename)
    "private/projects/#{campaign.project_id}/user_idp_plans/#{id}/#{attribute_name}/#{filename}"
  end

  private

  def schedule_idp_assigned_notification
    return if communication_emails.joins(:communication).
              exists?(communications: { kind: :idp_template_assigned })

    communication = Communication.order(:created_at).where(kind: :idp_template_assigned, campaign_id: campaign_id).last
    return unless communication

    communication.create_communication_email_with_resources(
      { user: user, campaign_user: campaign_user },
      self
    )
  end

  def schedule_idp_status_notification
    notification_kind = approved? ? :idp_template_approved : :idp_template_rejected
    return if communication_emails.joins(:communication).
              exists?(communications: { kind: notification_kind })

    communication = Communication.order(:created_at).
                    where(kind: notification_kind, campaign_id: campaign_id).
                    last
    return unless communication

    communication.create_communication_email_with_resources(
      { user: user, campaign_user: campaign_user },
      self
    )
  end
end
