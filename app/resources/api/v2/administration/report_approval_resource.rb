# frozen_string_literal: true

class Api::V2::Administration::ReportApprovalResource < Api::V2::Administration::BaseResource
  model_name 'ReportApproval'

  attributes :approval_status, :qc_user_ids, :approver_user_ids, :project_id, :pdf_url, :approval_status_updated_at,
             :qc_at, :approved_at

  has_one :report
  has_one :campaign
  has_one :project
  has_one :user
  has_one :approver_user, class_name: 'User'
  has_one :qc_user, class_name: 'User'

  ransack_filters %i[campaign_id_eq report_id_eq user_id_eq campaign_name_cont
                     report_name_cont user_email_cont user_full_name_cont
                     user_email_cont approval_status_in]

  filter :my_tasks, apply: lambda { |records, _, options|
    records.merge(ReportApprovalSetting.user_tasks(options[:context][:user]))
  }

  def pdf_url
    @model.as_user_report.pdf_file&.url if Administration::UserReportPolicy.new(context[:user], @model).download?
  end

  def project_id
    @model.campaign.project_id
  end

  def self.records(_)
    super.select('user_reports.*', 'qc_user_ids', 'approver_user_ids')
  end
end
