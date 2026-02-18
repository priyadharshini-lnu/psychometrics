# frozen_string_literal: true

module UserAssessments
  class PostScoringTasks < BaseCommand
    private_attr_reader :user_assessment, :user_result, :current_user, :rescore

    def initialize(user_assessment, current_user = nil, rescore: false)
      @user_assessment = user_assessment
      @user_result = user_assessment.users_result
      @current_user = current_user || user_assessment.user
      @rescore = rescore
    end

    def call
      update_timestamp
      transaction do
        start_approvals
        normalize_factor_scores

        unless rescore || user_assessment.external?
          generate_reports
          trigger_webhooks
        end
      end

      broadcast :ok
    end

    private

    def update_timestamp
      user_assessment.update!(score_calculated: true, score_calculated_at: Time.zone.now)
    end

    def start_approvals
      user_assessment.user_reports.each(&:start_approval!)
    end

    def normalize_factor_scores
      ::UserAssessments::NormalizeFactorScores.call(user_assessment)
    end

    def generate_reports
      ::UsersResults::GenerateReports.call!(user_result, current_user)
    end

    def trigger_webhooks
      webhook = UserAssessments::Webhook.new(user_assessment)
      webhook.publish_assessment_completed
      webhook.publish_assessment_raw_response
      webhook.publish_results_available
    end
  end
end
