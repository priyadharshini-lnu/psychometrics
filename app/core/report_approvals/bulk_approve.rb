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
      send_digest_emails

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

    def update_user_report(report_approval, status)
      # Convert ReportApproval to UserReport to access workflow methods
      user_report = report_approval.as_user_report

      case status
        when 'approved'
          approve_report(user_report)
        else
          send_for_approval(user_report)
      end
    end

    def approve_report(user_report)
      return unless user_report.can_approve?

      if user_report.approval_setting.send_digest_emails
        user_report.update!(approval_status: 'approved')
      else
        user_report.approve!
      end

      user_report.update!(
        approver_user_id: current_user.id,
        approved_at: Time.current
      )
    end

    def send_for_approval(user_report)
      return unless user_report.can_send_for_approval?

      if user_report.approval_setting.send_digest_emails
        user_report.update!(approval_status: 'qc_completed')
      else
        user_report.send_for_approval!
      end

      user_report.update!(
        qc_user_id: current_user.id,
        qc_at: Time.current
      )
    end

    def send_digest_emails
      grouped_reports = UserReport.where(id: user_report_ids).
                        group_by { |report| [report.campaign_id, report.report_id] }
      grouped_reports.each do |(campaign_id, report_id), reports|
        report_approval_setting = ReportApprovalSetting.find_by(campaign_id: campaign_id, report_id: report_id)

        next if report_approval_setting&.do_not_send_notifications?
        next unless report_approval_setting&.send_digest_emails
        next unless report_approval_setting.digest_delivery_mode == 'immediate'

        new_status = reports.first.approval_status
        report_ids = reports.map(&:id)
        SendDigestEmailsJob.perform_later(report_ids, campaign_id, report_id, new_status)
      end
    end
  end
end
