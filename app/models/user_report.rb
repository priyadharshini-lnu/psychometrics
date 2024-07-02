# frozen_string_literal: true

class UserReport < ApplicationRecord
  audited

  include WorkflowActiverecord
  include ActiveStorageAttachable

  belongs_to :user, inverse_of: :user_reports
  belongs_to :report
  belongs_to :norm
  belongs_to :campaign
  belongs_to :report_family
  belongs_to :approval_status_owner, class_name: 'User'

  has_one :project, through: :campaign
  has_one :threesixty_campaign, through: :campaign
  has_one :subject, -> { where('campaign_id = threesixty_subjects.campaign_id') },
          foreign_key: :user_id, primary_key: :user_id,
          class_name: 'Threesixty::Subject'
  has_many :text_module_overrides, dependent: :destroy
  has_many :user_report_comments
  has_many :user_report_events

  delegate :client, to: :campaign
  delegate :modules_empty?, to: :report, prefix: true
  delegate :external_report?, :provider_custom_upload?, to: :report
  delegate :external_package_id, to: :report_families_report, allow_nil: true

  # NOTE: renaming attribute to :pdf_file to not to have `stack level too deep` conflicts
  # when serializing user_reports; :pdf attribute already exists in schema
  has_one_attachment :pdf_file,
                     service: Settings.storage.private_storage_service,
                     content_type: %w[application/pdf]

  def attachment_storage_path(attribute_name, filename)
    "private/projects/#{project.id}/user_report/#{id}/#{attribute_name}/#{filename}"
  end

  enum status: { not_prepared: 0, generating: 1, failed: 2, prepared: 3 }

  after_commit :publish_to_webhook,
               if: proc { status_previously_changed? && status == 'prepared' },
               on: [:update]

  workflow_column :approval_status

  workflow do # rubocop:disable Metrics/BlockLength
    state :not_ready do
      event :ready, transitions_to: :pending_qc
    end
    state :pending_qc do
      event :start_qc, transitions_to: :qc_in_progress
    end
    state :qc_in_progress do
      event :abort_qc, transitions_to: :pending_qc
      event :send_for_approval, transitions_to: :qc_completed
    end
    state :qc_completed do
      event :approve, transitions_to: :approved
      event :request_changes, transitions_to: :change_requested
    end
    state :change_requested do
      event :start_qc, transitions_to: :qc_in_progress
    end
    state :approved do
      event :remove_approval, transitions_to: :change_requested
    end
    on_transition do |_from, to, _event, *_|
      ::UserReports::NotifyQc.call!(self) if %i[change_requested pending_qc].include?(to)
      ::UserReports::NotifyApprovals.call!(self) if to == :approved
      ::UserReports::NotifyApprovers.call!(self) if to == :qc_completed
      update(approval_status_updated_at: Time.current)

      update(approver_user_id: nil, approved_at: nil) if to == :change_requested
    end
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
    return ready! if not_ready? && has_approval_workflow?
  end

  def has_approval_workflow?
    approval_settings.exists?
  end

  def approval_settings
    campaign.report_approval_settings.where(report_id: report_id)
  end

  def threesixty_subject
    campaign.subjects.find_by(user_id: user_id)
  end

  def self.assessor_report_for_campaign(campaign_id)
    accessible_report_ids = CampaignReport.where(campaign_id: campaign_id, assessor_access: true).pluck(:report_id)
    where(campaign_id: campaign_id, report_id: accessible_report_ids)
  end

  def attach_pdf!(data)
    case data
      when String
        pdf_file.attach(
          ActiveStorageSupport::Base64Attach.attachment_from_data({ data: "data:application/pdf;base64,[#{data}]" })
        )
      when File
        pdf_file.attach(
          io: data,
          filename: File.basename(data),
          content_type: File.extname(data)
        )
      else
        return false
    end

    self.status = :prepared
    save!
  end

  def pdf_exists?
    pdf_file.attached?
  end

  def remove_report_pdf!
    pdf_file.purge_later
    self.status = :not_prepared
    self.approval_status = :not_ready if has_approval_workflow?
    save!
  end

  def user_results(view_report_as = nil)
    UserReports::GetUserResultsQuery.new(self, view_report_as).query
  end

  def all_assessments_are_completed?(except_assessment_ids: [])
    completed_assessment_ids = user_results.includes(:user_assessment).pluck('user_assessments.assessment_id')

    report.assessment_ids.all? { |id| except_assessment_ids.include?(id) || completed_assessment_ids.include?(id) }
  end

  def has_report_data_config?
    report.data_configuration.present?
  end

  def publish_results_available?
    all_assessments_are_completed? && has_report_data_config?
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
    generate = all_assessments_are_completed? && (external_report? || !report_modules_empty?)
    generate &&= approved? if has_approval_workflow?
    generate &&= campaign_user.campaign_scores_finalized? if report.campaign_factors.present?
    generate
  end

  def log_attributes
    slice(:campaign_id, :report_id, :user_id, :status)
  end

  def publish_to_webhook
    UserReports::Webhook.new(self).publish_report_available
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
      campaign: campaign
    }
  end

  def pdf_download_url
    return unless pdf_exists?

    pdf_file.url(disposition: 'attachment')
  end

  def remove_pdf_and_update_status!
    return unless prepared?

    update!(purge_pdf_file: true, status: :not_prepared, approval_status: :not_ready)
  end
end
