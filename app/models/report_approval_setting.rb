# frozen_string_literal: true

class ReportApprovalSetting < ApplicationRecord
  audited

  belongs_to :campaign
  belongs_to :report

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
    scope = ReportApproval.joins(
      %(
        join report_approval_settings as ras on user_reports.campaign_id = ras.campaign_id
        AND user_reports.report_id = ras.report_id
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
end
