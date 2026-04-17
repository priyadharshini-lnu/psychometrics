# frozen_string_literal: true

module ScoreApprovals
  class NotifyApprovers < BaseCommand
    def initialize(score_approval)
      @score_approval = score_approval
      ids = score_approval.setting&.approver_ids
      @users = User.where(id: ids, project_id: nil)
    end

    def call
      @users.each do |user|
        ::ScoringApproving::ApproverNotificationMailer.notify(@score_approval, user).deliver_later
      end
    end
  end
end
