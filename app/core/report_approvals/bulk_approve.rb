# frozen_string_literal: true

module ReportApprovals
  class BulkApprove < BaseCommand
    attr_reader :current_user, :user_report_ids

    def initialize(user_report_ids, current_user)
      @user_report_ids = user_report_ids
      @current_user = current_user
    end

    def call
      new_statuses = []
      meta = initialize_meta

      user_reports.find_each do |user_report|
        process_user_report(user_report, new_statuses, meta)
      end

      broadcast :ok, new_statuses, meta
    end

    private

    def user_reports
      ::ReportApprovalSetting.user_tasks(current_user).
        where(id: user_report_ids).
        select('user_reports.*', 'qc_user_ids', 'approver_user_ids', 'allow_qc_bulk_submit',
               'approvers_not_required', 'allow_bulk_approve', 'allow_qc_bulk_submit')
    end

    def initialize_meta
      {
        approved: 0,
        qc_completed: 0,
        ignored: 0
      }
    end

    def process_user_report(user_report, new_statuses, meta)
      unless allowed_bulk_operation?(user_report)
        meta[:ignored] += 1
        return
      end

      status = determine_status(user_report)
      meta[status.to_sym] += 1
      update_user_report(user_report, status)
      new_statuses << user_report
    end

    def allowed_bulk_operation?(user_report)
      return false if user_report.approval_status == 'approved'
      return false unless allow_send_for_approval?(user_report)
      return false unless allow_approve?(user_report)
      return false if user_report.approvers_not_required && user_report.qc_user_ids.exclude?(current_user.id)

      true
    end

    def allow_send_for_approval?(user_report)
      return true if %w[pending_qc qc_in_progress].exclude?(user_report.approval_status)

      user_report.allow_qc_bulk_submit && user_report.qc_user_ids.include?(current_user.id)
    end

    def allow_approve?(user_report)
      return true unless user_report.approval_status == 'qc_completed'

      user_report.allow_bulk_approve && user_report.allow_approve?
    end

    def determine_status(user_report)
      if user_report.approval_status == 'qc_completed' || user_report.approvers_not_required
        'approved'
      else
        'qc_completed'
      end
    end

    def update_user_report(user_report, status)
      user_report.update!(
        approver_user_id: current_user.id,
        approved_at: Time.current,
        approval_status: status
      )
    end
  end
end
