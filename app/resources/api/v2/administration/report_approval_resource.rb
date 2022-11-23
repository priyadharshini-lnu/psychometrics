# frozen_string_literal: true

class Api::V2::Administration::ReportApprovalResource < Api::V2::Administration::BaseResource
  model_name 'ReportApproval'

  attributes :approval_status, :qc_user_ids, :approver_user_ids

  has_one :report
  has_one :campaign
  has_one :user

  ransack_filters %i[campaign_id_eq report_id_eq user_id_eq approval_status_eq]

  filter :my_tasks, apply: lambda { |records, _, options|
    records.merge(ReportApprovalSetting.user_tasks(options[:context][:user]))
  }

  def self.records(_)
    super.select('user_reports.*', 'qc_user_ids', 'approver_user_ids')
  end
end
