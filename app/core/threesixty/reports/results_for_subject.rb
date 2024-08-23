# frozen_string_literal: true

module Threesixty::Reports
  class ResultsForSubject < BaseCommand
    attr_reader :campaign, :subject, :report, :locale, :current_user

    def initialize(user_report, current_user)
      @campaign = user_report.campaign
      @current_user = current_user
      @subject = Threesixty::Subject.find_by(campaign_id: campaign.id, user_id: user_report.user_id)
    end

    def call
      broadcast :ok, serialize_results
    end

    def serialize_results
      lookup_results.group_by { |result| result[:assessment_id] }
    end

    def lookup_results
      participants = Threesixty::EvaluatorParticipantsBySubject.new(subject.user_id, campaign.id).query
      UserAssessment.
        scored.
        where(campaign_id: campaign.id, evaluator_id: participants.map(&:evaluator_id), subject_id: subject.user_id).
        includes(:evaluator, :assessment, :users_result).
        map do |user_assessment|
        ::Reports::ResultSerializer.new(
          user_assessment.users_result,
          campaign: campaign
        ).to_h
      end
    end
  end
end
