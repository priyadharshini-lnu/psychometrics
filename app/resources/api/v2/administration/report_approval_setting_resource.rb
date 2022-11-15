# frozen_string_literal: true

class Api::V2::Administration::ReportApprovalSettingResource < Api::V2::Administration::BaseResource
  attributes :qc_user_ids, :approver_user_ids, :approval_notification_user_ids, :qcs, :approvers,
             :approval_notification_users

  has_one :campaign
  has_one :report

  ransack_filters %i[campaign_id_eq]

  def fetchable_fields
    super - %i[qc_user_ids approver_user_ids approval_notification_user_ids]
  end

  def self.creatable_fields(_)
    super - %i[qcs approvers approval_notification_users]
  end

  def self.updatable_fields(values)
    creatable_fields(values)
  end

  def qcs
    qc_user_ids.filter_map { |id| users[id]&.slice(:id, :email) }
  end

  def approvers
    approver_user_ids.filter_map { |id| users[id]&.slice(:id, :email) }
  end

  def approval_notification_users
    approval_notification_user_ids.filter_map { |id| users[id.to_i]&.slice(:id, :email) }
  end

  private

  def users
    @users ||= User.where(id: qc_user_ids + approver_user_ids + approval_notification_user_ids).index_by(&:id)
  end
end
