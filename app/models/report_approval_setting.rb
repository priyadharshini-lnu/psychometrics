# frozen_string_literal: true

class ReportApprovalSetting < ApplicationRecord
  audited
  include ApplicationConfigurationLoggable

  belongs_to :campaign
  belongs_to :report
  include Tenantable

  enum :digest_frequency, { daily: 'daily', weekly: 'weekly', weekdays: 'weekdays' }
  enum :digest_delivery_mode, { immediate: 'immediate', scheduled: 'scheduled' }, prefix: :digest_delivery

  before_save :set_digest_emails_enabled_at, if: :will_save_change_to_send_digest_emails?
  after_commit :trigger_cleanup_email, if: :digest_delivery_mode_or_enabled_changed?

  scope :for_user, lambda { |user_id|
    where(
      'qc_user_ids @> :user_id OR approver_user_ids @> :user_id OR approval_notification_user_ids @> :user_id',
      user_id: "{#{user_id}}"
    )
  }

  scope :where_participate, lambda { |user_id, campaign_id|
    where('qc_user_ids @> :user_id OR approver_user_ids @> :user_id OR approval_notification_user_ids @> :user_id',
          user_id: "{#{user_id}}", campaign_id: campaign_id)
  }

  scope :approvers, lambda { |user_id, campaign_id|
    where('approver_user_ids @> :user_id', user_id: "{#{user_id}}", campaign_id: campaign_id)
  }

  scope :notifications, lambda { |user_id, campaign_id|
    where('approval_notification_user_ids @> :user_id', user_id: "{#{user_id}}", campaign_id: campaign_id)
  }

  scope :qcs, lambda { |user_id, campaign_id|
    where('qc_user_ids @> :user_id', user_id: "{#{user_id}}", campaign_id: campaign_id)
  }

  def self.report_approvals(user)
    geo_filtered_scope = ReportApproval.geo_scoped(Current.user_country)

    scope = geo_filtered_scope.joins(
      %(
        join report_approval_settings on user_reports.campaign_id = report_approval_settings.campaign_id
        AND user_reports.report_id = report_approval_settings.report_id
      )
    )

    return scope if user.is?(:superadmin)

    scope.merge(ReportApprovalSetting.for_user(user.id))
  end

  def self.user_tasks(user)
    report_approvals(user).where(
      %{
        (qc_user_ids @> :user_id AND approval_status IN (:qc_statuses)) OR
        (approver_user_ids @> :user_id AND approval_status = 'qc_completed') OR
        (approvers_not_required = true AND approval_status IN (:all_statuses))
      },
      user_id: "{#{user.id}}",
      qc_statuses: %i[pending_qc qc_in_progress change_requested],
      all_statuses: %i[pending_qc qc_in_progress change_requested qc_completed]
    )
  end

  private

  def digest_delivery_mode_or_enabled_changed?
    saved_change_to_digest_delivery_mode? || saved_change_to_send_digest_emails?
  end

  def trigger_cleanup_email
    if (saved_change_to_digest_delivery_mode? && digest_delivery_mode_previously_was == 'scheduled') ||
       (saved_change_to_send_digest_emails? && send_digest_emails_previously_was == true && !send_digest_emails)
      ::ReportApprovals::DigestEmailSender.send_for(self)
    end
  end

  def set_digest_emails_enabled_at
    if send_digest_emails_changed?(from: false, to: true)
      self.digest_emails_enabled_at = Time.current
    end
  end
end
