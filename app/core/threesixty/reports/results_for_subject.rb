# frozen_string_literal: true

module Threesixty::Reports
  class ResultsForSubject < BaseCommand
    attr_reader :campaign, :project, :subject, :report, :locale

    def initialize(campaign, users_report)
      @campaign = campaign

      @project = campaign.project
      @subject = Threesixty::Subject.find_by(campaign_id: campaign.campaign.id, user_id: users_report.user_id)
      @report = campaign.report
    end

    def call
      broadcast :ok, serialize_results
    end

    def serialize_results
      lookup_results.group_by { |result| result[:assessment_id] }
    end

    def lookup_results
      participants = Threesixty::EvaluatorParticipantsBySubject.new(subject).query
      UsersResult.completed.
        where(evaluator_id: participants.map(&:evaluator_id)).
        includes(:evaluator, :assessment).
        map do |result|
          participant = participants.find_by(evaluator_id: result.evaluator_id)
          ::UsersResultSerializer.new(result, campaign: campaign, participant: participant).to_h
      end
    end
  end
end
