# frozen_string_literal: true

# rubocop:disable Metrics/ClassLength

class UserReport < ApplicationRecord
  audited

  attr_accessor :skip_owner_validation

  include OwnerCompatibility
  include WorkflowActiverecord
  include ActiveStorageAttachable
  include HoganResource
  include UserReportPdfHelper

  belongs_to :user, inverse_of: :user_reports
  belongs_to :report
  belongs_to :campaign
  belongs_to :report_family
  include Tenantable

  belongs_to :norm
  belongs_to :approval_status_owner, class_name: 'User'

  has_one :project, through: :campaign
  has_one :threesixty_campaign, through: :campaign
  has_one :subject, ->(user_report) { where(campaign_id: user_report.campaign_id) },
          foreign_key: :user_id, primary_key: :user_id,
          class_name: 'Threesixty::Subject'
  has_many :text_module_overrides, dependent: :destroy
  has_many :user_report_comments
  has_many :user_report_events
  has_many :communication_email_resources, as: :resource
  has_many :communication_emails, through: :communication_email_resources
  has_many :user_report_pdfs, dependent: :destroy
  has_one :ai_translation, class_name: 'AI::TranslationResult', as: 'translatable', dependent: :destroy

  alias report_pdfs user_report_pdfs

  delegate :client, to: :campaign
  delegate :modules_empty?, to: :report, prefix: true
  delegate :external_report?, :provider_custom_upload?, :hogan?, to: :report
  delegate :external_package_id, to: :report_families_report, allow_nil: true

  # NOTE: renaming attribute to :pdf_file to not to have `stack level too deep` conflicts
  # when serializing user_reports; :pdf attribute already exists in schema
  has_one_attachment :pdf_file,
                     service: Settings.storage.private_storage_service,
                     content_type: %w[application/pdf]

  def attachment_storage_path(attribute_name, filename)
    "private/projects/#{project.id}/user_report/#{id}/#{attribute_name}/#{filename}"
  end

  enum :status, { not_prepared: 0, generating: 1, failed: 2, prepared: 3 }

  after_commit :schedule_report_available_notification,
               if: proc {
                 (status_previously_changed? || saved_change_to_user_access?) && can_notify_report_availablity?
               },
               on: [:update]

  scope :for_assessment, lambda { |assessment_id|
                           joins(report: :assessments_reports).
                             where(assessments_reports: { assessment_id: assessment_id })
                         }
  validate :campaign_owner_compatibility_with_report_owner,
           if: :validate_campaign_owner_compatibility_with_report_owner?
  validate :campaign_owner_compatibility_with_report_family_owner,
           if: :validate_campaign_owner_compatibility_with_report_family_owner?

  workflow_column :approval_status
  workflow do # rubocop:disable Metrics/BlockLength
    state :not_ready do
      event :ready, transitions_to: :pending_qc
    end
    state :pending_qc do
      event :start_qc, transitions_to: :qc_in_progress
      event :send_for_approval, transitions_to: :qc_completed
      event :approve, transitions_to: :approved # Allow direct approval for one-level QC
    end
    state :qc_in_progress do
      event :abort_qc, transitions_to: :pending_qc
      event :send_for_approval, transitions_to: :qc_completed
    end
    state :qc_completed do
      event :approve, transitions_to: :approved
      event :request_changes, transitions_to: :qc_in_progress, if: ->(ua) { ua.one_level_qc? }
      event :request_changes, transitions_to: :change_requested, if: ->(ua) { !ua.one_level_qc? }
    end
    state :change_requested do
      event :start_qc, transitions_to: :qc_in_progress
    end
    state :approved do
      event :remove_approval, transitions_to: :qc_in_progress, if: ->(ua) { ua.one_level_qc? }
      event :remove_approval, transitions_to: :change_requested, if: ->(ua) { !ua.one_level_qc? }
    end
    on_transition do |_from, to, _event, *_|
      unless approval_setting&.do_not_send_notifications?
        ::UserReports::NotifyQc.call!(self, to) if %i[change_requested pending_qc].include?(to)
        ::UserReports::NotifyApprovals.call!(self) if to == :approved
        ::UserReports::NotifyApprovers.call!(self) if to == :qc_completed && send_approver_email?
      end

      update(approval_status_updated_at: Time.current)
      update(approver_user_id: nil, approved_at: nil) if to == :change_requested
    end
  end

  def effective_default_language
    @effective_default_language ||= campaign_report&.effective_default_language || report.default_language
  end

  def campaign_report
    @campaign_report ||= campaign.campaign_reports.find_by(report_id: report_id)
  end

  def other_reports_in_same_package
    return UserReport.none unless external_package_id

    report_ids = report_family.report_families_reports.where(external_package_id: external_package_id).pluck(:report_id)

    UserReport.where(report_id: report_ids, campaign_id: campaign_id, user_id: user_id).where.not(id: id)
  end

  def campaign_user
    CampaignUser.find_by(campaign_id: campaign_id, user_id: user_id)
  end

  def start_approval!
    with_lock do
      return unless not_ready?
      return unless has_approval_workflow?

      if threesixty?
        ready! if threesixty_report_ready_for_approval?
      elsif common_report_ready_for_approval?
        ready!
      end
    end
  end

  def common_report_ready_for_approval?
    return false unless all_assessments_are_scored?
    return false if report.campaign_factors.present? && !campaign_user&.campaign_scores_finalized?
    return false if report.campaign_ai_artifacts.present? && !campaign_user&.campaign_artifact_results_finalized?

    true
  end

  def threesixty_report_ready_for_approval?
    return false unless threesixty_subject&.evaluation_status_completed?
    return false if report.campaign_ai_artifacts.present? && !campaign_user&.campaign_artifact_results_finalized?

    true
  end

  def has_approval_workflow?
    approval_settings.exists?
  end

  def approval_settings
    campaign.report_approval_settings.where(report_id: report_id)
  end

  def approval_setting
    approval_settings.first
  end

  def send_approver_email?
    !approval_setting&.approvers_not_required?
  end

  def one_level_qc?
    approval_setting&.approvers_not_required? || approval_setting&.approvers_can_edit?
  end

  def threesixty_subject
    campaign.subjects.find_by(user_id: user_id)
  end

  def threesixty?
    return false unless threesixty_campaign

    threesixty_campaign.subjects.exists?(user_id: user_id)
  end

  def self.assessor_report_for_campaign(campaign_id)
    accessible_report_ids = CampaignReport.where(campaign_id: campaign_id, assessor_access: true).pluck(:report_id)
    where(campaign_id: campaign_id, report_id: accessible_report_ids)
  end

  def user_results(view_report_as = nil)
    UserReports::GetUserResultsQuery.new(self, view_report_as).query
  end

  def all_assessments_are_scored?(except_assessment_ids: [])
    completed_assessment_ids = user_results.includes(:user_assessment).pluck('user_assessments.assessment_id')

    report.assessment_ids.all? { |id| except_assessment_ids.include?(id) || completed_assessment_ids.include?(id) }
  end

  def has_report_data_config?
    report.data_configuration.present?
  end

  def publish_results_available?
    all_assessments_are_scored? && has_report_data_config?
  end

  def possible_webhook_events
    events = []
    events << Webhook::USER_REPORT_EVENTS[:results_available] if publish_results_available?
    events << Webhook::USER_REPORT_EVENTS[:report_available] if has_user_results?
    events
  end

  def has_user_results?
    user_results.exists?
  end

  def generatable?
    if threesixty?
      threesixty_report_generatable?
    else
      common_report_generatable?
    end
  end

  def threesixty_report_generatable?
    return false if report_modules_empty?

    generate = true
    generate &&= approved? if has_approval_workflow?
    generate &&= campaign_user.campaign_artifact_results_finalized? if report.campaign_ai_artifacts.present?
    generate
  end

  def common_report_generatable?
    return false if provider_custom_upload?

    common_report_generation_ready?
  end

  def can_mark_ready?
    return false unless not_ready?
    return false unless has_approval_workflow?
    return false if provider_custom_upload?

    common_report_generation_ready?(check_approval: false)
  end

  def common_report_generation_ready?(check_approval: true)
    generate = all_assessments_are_scored? && (external_report? || !report_modules_empty?)
    generate &&= approved? if check_approval && has_approval_workflow?
    generate &&= campaign_user.campaign_scores_finalized? if report.campaign_factors.present?
    generate &&= campaign_user.campaign_artifact_results_finalized? if report.campaign_ai_artifacts.present?
    generate
  end

  def log_attributes
    slice(:campaign_id, :report_id, :user_id, :status)
  end

  def report_families_report
    @report_families_report ||= report.report_families_reports.find_by(report_family_id: report_family_id)
  end

  def external_report_id
    report.external_settings[:report_id]
  end

  def details_to_log
    {
      user_email: user.email,
      user_name: user.decorate.full_name,
      report_name: report.name
    }
  end

  def piped_text_context
    {
      subject: user,
      evaluator: user,
      campaign: campaign,
      threesixty_campaign: threesixty_campaign
    }
  end

  def report_available_for_end_user?
    status == 'prepared' && user_access == true
  end

  def report_available_email_already_sent?
    communication_emails.joins(:communication).exists?(communications: { kind: :report_available })
  end

  def can_notify_report_availablity?
    return false unless report_available_for_end_user?
    return false if report_available_email_already_sent?

    true
  end

  def schedule_report_available_notification
    communication = Communication.order(:created_at).where(kind: :report_available, campaign_id: campaign_id).last
    return unless communication

    communication.create_communication_email_with_resources(
      { user: user, campaign_user: campaign_user },
      self
    )
  end

  def last_assessment_completed_at
    user_results.joins(:user_assessment).
      order('user_assessments.completed_at DESC').
      pick('user_assessments.completed_at')
  end

  private

  def validate_campaign_owner_compatibility_with_report_owner?
    return false if skip_owner_validation == true
    return false if campaign.blank? || report.blank?

    new_record? || will_save_change_to_campaign_id? || will_save_change_to_report_id?
  end

  def campaign_owner_compatibility_with_report_owner
    return if compatible_owner_ids?(campaign.tenant_id, report.owner_id)

    add_owner_compatibility_error(
      :report_id,
      child_resource: :report,
      parent_resource: :campaign
    )
  end

  def validate_campaign_owner_compatibility_with_report_family_owner?
    return false if skip_owner_validation == true
    return false if campaign.blank? || report_family.blank?

    new_record? || will_save_change_to_campaign_id? || will_save_change_to_report_family_id?
  end

  def campaign_owner_compatibility_with_report_family_owner
    return if compatible_owner_ids?(campaign.tenant_id, report_family.tenant_id)

    add_owner_compatibility_error(
      :report_family_id,
      child_resource: :report_bundle,
      parent_resource: :campaign
    )
  end
end

# rubocop:enable Metrics/ClassLength
