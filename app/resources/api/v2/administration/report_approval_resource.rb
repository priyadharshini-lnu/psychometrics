# frozen_string_literal: true

class Api::V2::Administration::ReportApprovalResource < Api::V2::Administration::BaseResource
  model_name 'ReportApproval'

  attributes :approval_status, :qc_user_ids, :approver_user_ids, :project_id, :pdf_url, :approval_status_updated_at,
             :qc_at, :approved_at, :allow_qc_bulk_submit, :allow_bulk_approve

  has_one :report
  has_one :campaign
  has_one :project
  has_one :user
  has_one :approver_user, class_name: 'User'
  has_one :qc_user, class_name: 'User'

  ransack_filters %i[campaign_id_eq report_id_eq campaign_id_in report_id_in user_id_eq campaign_name_cont
                     report_name_cont user_email_cont user_full_name_cont
                     user_email_cont approval_status_in qc_user_id_in approver_user_id_in]

  filter :my_tasks, apply: lambda { |records, _, options|
    records.merge(ReportApprovalSetting.user_tasks(options[:context][:user]))
  }

  def pdf_url
    if Administration::UserReportPolicy.new(context[:user], @model).download?
      @model.as_user_report.pdf_url
    end
  end

  def allow_bulk_approve
    @model.allow_bulk_approve && @model.allow_approve?
  end

  def allow_qc_bulk_submit
    @model.allow_qc_bulk_submit && %i[pending_qc qc_in_progress change_requested].include?(@model.approval_status)
  end

  def project_id
    @model.campaign.project_id
  end

  def self.records(_)
    super.select('user_reports.*', 'qc_user_ids', 'approver_user_ids', 'allow_qc_bulk_submit', 'allow_bulk_approve')
  end
end
