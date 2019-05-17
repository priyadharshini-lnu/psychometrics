# frozen_string_literal: true

module Threesixty::Reports
  class ResultsForSubject < BaseCommand
    attr_reader :campaign, :project, :subject, :report, :locale

    def initialize(campaign, users_result)
      @campaign = campaign

      @project = campaign.project
      @subject = Threesixty::Subject.find_by(campaign_id: campaign.campaign.id, user_id: users_result.user_id)
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
      participants_map = participants.index_by(&:evaluator_id)
      data_sheet_map = DatasheetRow.
        joins(:datasheet).
        where(datasheets: { project_id: project.id }, email: participants.map(&:evaluator_email)).
        index_by(&:email)

      UsersResult.completed.
        where(evaluator_id: participants.map(&:evaluator_id)).
        includes(:evaluator, :assessment).
        map do |result|
          ::UsersResultSerializer.new(result, campaign: campaign).to_h
      end
    end
  end
end
