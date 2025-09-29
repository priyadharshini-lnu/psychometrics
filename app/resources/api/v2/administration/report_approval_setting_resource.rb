# frozen_string_literal: true

class Api::V2::Administration::ReportApprovalSettingResource < Api::V2::Administration::BaseResource
  attributes :qc_user_ids, :approver_user_ids, :approval_notification_user_ids, :qcs, :approvers,
             :approval_notification_users, :approvers_can_edit, :approvers_not_required,
             :do_not_send_notifications, :allow_bulk_approve, :allow_qc_bulk_submit, :send_digest_emails,
             :digest_frequency, :digest_weekdays, :digest_time, :digest_timezone

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

  def self.records(opts)
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

  def digest_time
    return nil unless @model.digest_time

    @model.digest_time.strftime('%I:%M %p')
  end

  private

  def user_details(user_ids)
    user_ids.filter_map do |id|
      user = users[id]
      next unless user

      user.slice(:email).merge(name: user.decorate.display_name, id: user.id.to_s)
    end
  end

  def users
    @users ||= User.where(id: qc_user_ids + approver_user_ids + approval_notification_user_ids).index_by(&:id)
  end
end
