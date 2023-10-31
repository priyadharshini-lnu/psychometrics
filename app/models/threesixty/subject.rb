# frozen_string_literal: true

module Threesixty
  class Subject < ApplicationRecord
    audited

    include Threesixty::Participator

    has_many :participants, primary_key: :user_id

    has_many :subjects_relationships, primary_key: :user_id

    enum report_approval_status: { waiting: 0, approved: 1, denied: 2 }, _prefix: :report
    enum report_release_status: { waiting: 0, released: 1, on_hold: 2 }, _prefix: :report_status
    enum evaluation_status: { in_progress: 0, completed: 1 }, _prefix: :evaluation_status

    after_update :remove_report_pdf, if: proc { saved_change_to_evaluation_status? && evaluation_status_completed? }

    def evaluators
      participants.includes(:relationship, :subject, :evaluator).where(campaign_id: campaign_id)
    end

    # Removing report here to generate a new report on completion because
    # it's possible that a report was generated previously by admin and few evaluations are done after that.
    def remove_report_pdf
      report = user.user_reports.find_by!(campaign_id: campaign_id)
      if report.pdf_exists?
        report.remove_pdf!
        report.save
      end
    end
  end
end
