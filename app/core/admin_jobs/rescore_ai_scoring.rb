# frozen_string_literal: true

module AdminJobs
  class RescoreAIScoring < AdminJobs::Base
    def call
      record.update(total_tasks: 1)

      AI::ContentAnalysis::TriggerAIScoringJob.perform_later(
        users_result.id,
        rescore: true,
        force_regenerate: false,
        admin_job_record_id: record.id
      )

      broadcast :waiting
    end

    def generate_title_link
      return {} unless campaign

      {
        href: "/admin/ai_scoring_approvals/#{user_assessment.id}/review",
        label: "#{campaign.name} - #{subject&.decorate&.full_name}"
      }
    end

    def generate_details
      [
        [I18n.t('administration.users.user'), subject&.decorate&.full_name],
        [I18n.t('administration.assessments.assessment'), assessment_name]
      ]
    end

    def valid?
      users_result.present? && campaign.present?
    end

    private

    def users_result
      @users_result ||= UsersResult.find_by(id: record.data['users_result_id'])
    end

    def user_assessment
      @user_assessment ||= users_result&.user_assessment
    end

    def subject
      users_result&.user
    end

    def assessment_name
      users_result&.assessment&.name
    end
  end
end
