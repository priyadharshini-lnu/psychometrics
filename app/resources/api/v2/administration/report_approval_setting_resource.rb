# frozen_string_literal: true

class Api::V2::Administration::ReportApprovalSettingResource < Api::V2::Administration::BaseResource
  attributes :qc_user_ids, :approver_user_ids, :approval_notification_user_ids, :qcs, :approvers,
             :approval_notification_users

  has_one :campaign
  has_one :report

  before_create -> { @model.campaign = context[:campaign] }

  audit_log_for :create, payload: '*'
  audit_log_for :update, payload: '*'
  audit_log_for :destroy, payload: ->(_, record) { record.slice(:report_id, :campaign_id) }

  def fetchable_fields
    super - %i[qc_user_ids approver_user_ids approval_notification_user_ids]
  end

  def self.creatable_fields(_)
    super - %i[qcs approvers approval_notification_users campaign]
  end

  def self.updatable_fields(values)
    creatable_fields(values)
  end

  def self.record(opts)
    super.where(campaign_id: opts.dig(:context, :campaign).id)
  end

  def qcs
    user_details(qc_user_ids)
  end

  def approvers
    user_details(approver_user_ids)
  end

  def approval_notification_users
    user_details(approval_notification_user_ids)
  end

  private

  def user_details(_user_ids)
    qc_user_ids.filter_map do |id|
      user = users[id]
      next unless user

      user.slice(:id, :email).merge(name: user.decorate.display_name)
    end
  end

  def users
    @users ||= User.where(id: qc_user_ids + approver_user_ids + approval_notification_user_ids).index_by(&:id)
  end
end
