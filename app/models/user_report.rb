# frozen_string_literal: true

class UserReport < ApplicationRecord
  belongs_to :user, inverse_of: :user_reports
  belongs_to :report
  belongs_to :norm
  belongs_to :campaign
  belongs_to :report_family

  has_one :saville_report_setting, through: :report
  has_one :project, through: :campaign
  has_one :threesixty_campaign, through: :campaign
  has_many :text_module_overrides, dependent: :destroy

  delegate :client, to: :campaign
  delegate :saville_report_id, to: :report
  delegate :modules_empty?, to: :report, prefix: true
  delegate :external_report?, to: :report

  mount_base64_uploader :pdf, PdfUploader, file_name: proc { 'report' }

  enum status: { not_prepared: 0, generating: 1, failed: 2, prepared: 3 }

  after_commit :publish_to_webhook,
               if: proc { status_previously_changed? && status == 'prepared' },
               on: [:update]

  def threesixty_subject
    campaign.subjects.find_by(user_id: user_id)
  end

  def self.assessor_report_for_campaign(campaign_id)
    accessible_report_ids = CampaignReport.where(campaign_id: campaign_id, assessor_access: true).pluck(:report_id)
    where(campaign_id: campaign_id, report_id: accessible_report_ids)
  end

  def pdf_exists?
    pdf.file.present?
  end

  def user_results
    UserReports::GetUserResultsQuery.new(self).query
  end

  def all_assessments_are_completed?
    completed_assessment_ids = user_results.includes(:user_assessment).pluck('user_assessments.assessment_id')

    report.assessment_ids.all? { |id| completed_assessment_ids.include?(id) }
  end

  def generatable?
    generate = all_assessments_are_completed? && (external_report? || !report_modules_empty?)
    generate &&= approved? if report.require_approval?
    generate
  end

  def log_attribute_for_delete
    slice(:campaign_id, :report_id, :user_id)
  end

  def publish_to_webhook
    user_result = user_results.first
    return if user_result.nil?

    campaign = user_result.user_assessment.campaign

    data = {
      campaign: campaign,
      subject: user_result.subject,
      report: report,
      user_report: self
    }
    WebhookSubscriptions::Publish.call!(campaign.project, :report_available, data)
  end

  def report_families_report
    @report_families_report ||= report.report_families_reports.find_by(report_family_id: report_family_id)
  end

  def hogan_report_id
    report.hogan_report_setting.hogan_report_id
  end
end
