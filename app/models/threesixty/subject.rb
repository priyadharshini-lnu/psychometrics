# frozen_string_literal: true

module Threesixty
  class Subject < ApplicationRecord
    audited

    include Threesixty::Participator

    has_many :participants, primary_key: :user_id

    has_many :subjects_relationships, primary_key: :user_id

    belongs_to :evaluation_status_updated_by, class_name: 'User', optional: true
    include Tenantable

    enum :report_approval_status, { waiting: 0, approved: 1, denied: 2 }, prefix: :report
    enum :report_release_status, { waiting: 0, released: 1, on_hold: 2 }, prefix: :report_status
    enum :evaluation_status, { in_progress: 0, completed: 1 }, prefix: :evaluation_status

    # Only remove PDF if evaluation status changed FROM completed TO in_progress
    # (i.e., reopening evaluations), not the other way around
    after_update :remove_report_pdf, if: proc {
      saved_change_to_evaluation_status? &&
        evaluation_status_was == 'completed' &&
        evaluation_status_in_progress?
    }

    def evaluators
      participants.includes(:relationship, :subject, :evaluator).where(campaign_id: campaign_id)
    end

    def user_report
      user.user_reports.find_by(campaign_id: campaign_id)
    end

    def evaluation_marked_done_by
      return nil unless evaluation_status_completed?

      evaluation_status_updated_by
    end

    # Removing report here to generate a new report on completion because
    # it's possible that a report was generated previously by admin and few evaluations are done after that.
    def remove_report_pdf
      user.user_reports.find_by!(campaign_id: campaign_id).remove_report_pdf!
      user_report.start_approval!
    end
  end
end
