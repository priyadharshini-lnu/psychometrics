# frozen_string_literal: true

module ScoreApprovals
  class NotifyAssessors < BaseCommand
    def initialize(score_approval)
      @score_approval = score_approval
      @setting = score_approval.setting
      ids = @setting&.one_level_approve? ? @setting&.approver_ids : @setting&.assessor_ids
      @users = User.where(id: ids, project_id: nil)
    end

    def call
      @users.each do |user|
        ::ScoringApproving::AssessorNotificationMailer.notify(@score_approval, user).deliver_later
      end
    end
  end
end
