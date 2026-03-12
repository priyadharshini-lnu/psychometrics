# frozen_string_literal: true

module ScoreApprovals
  class BulkApprove < BaseCommand
    attr_reader :current_user, :user_assessment_ids

    def initialize(user_assessment_ids, current_user)
      @user_assessment_ids = user_assessment_ids
      @current_user = current_user
    end

    def call
      # TODO: complete bulk approve
      broadcast :ok
    end

    private

    def initialize_meta
      {
        approved: 0,
        ignored: 0
      }
    end

    def send_digest_emails
      # TODO: implement email sending logic
    end
  end
end
