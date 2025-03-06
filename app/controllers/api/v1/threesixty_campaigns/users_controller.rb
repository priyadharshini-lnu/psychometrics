# frozen_string_literal: true

module Api
  module V1
    module ThreesixtyCampaigns
      class UsersController < BaseController
        def assessments
          evaluations = user_assessments.map do |assessment|
            {
              subject_id: assessment.subject_id,
              subject_email: assessment.subject.email,
              status: assessment.status,
              started_at: assessment.started_at,
              completed_at: assessment.completed_at
            }
          end

          render json: { evaluations: evaluations }, status: :ok
        end

        def scores
          scores = ::Threesixty::FactorScoresCalculator.call!(user, @campaign)
          render json: scores, status: :ok
        end

        private

        def user_assessments
          UserAssessment.
            where(evaluator_id: user.id, campaign_id: @campaign.id).
            select(
              :id, :subject_id, :status, :started_at, :completed_at
            ).
            includes(:subject)
        end

        def pundit_authorize
          authorize(
            ::Threesixty::Campaign,
            nil,
            policy_class: UserPolicy,
            project_id: project_id,
            campaign_id: params[:campaign_id]
          )
        end
      end
    end
  end
end
