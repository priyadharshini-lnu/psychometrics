# frozen_string_literal: true

module ScoreApprovals
  class NotifyApprovalNotifications < BaseCommand
    def initialize(score_approval)
      @score_approval = score_approval
      ids = score_approval.setting&.approval_notification_user_ids
      @users = User.where(id: ids, project_id: nil)
    end

    def call
      @users.each do |user|
        ::ScoringApproving::ApprovalNotificationMailer.notify(@score_approval, user).deliver_later
      end
    end
  end
end
