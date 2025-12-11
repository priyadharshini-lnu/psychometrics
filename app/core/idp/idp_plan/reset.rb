# frozen_string_literal: true

module Idp
  module IdpPlan
    class Reset < BaseCommand
      attr_accessor :user_idp_plan

      def initialize(user_idp_plan)
        @user_idp_plan = user_idp_plan
      end

      def call
        ActiveRecord::Base.transaction do
          user_idp_plan.user_idp_skills.destroy_all
          user_idp_plan.user_idp_development_actions.destroy_all
          user_idp_plan.user_idp_comments.destroy_all
          user_idp_plan.user_reflection_question_answers.destroy_all
          user_idp_plan.versions.destroy_all
          user_idp_plan.ai_assisted_idp_session&.destroy!
          user_idp_plan.user_document.purge_later if user_idp_plan.user_document.attached?
          user_idp_plan.update!(
            approval_status: 'not_started',
            completion_status: 'not_started',
            started_at: nil,
            completed_at: nil,
            last_approved_at: nil,
            review_note: nil
          )

          broadcast :ok
        end
      rescue StandardError => e
        broadcast :error, e.message
      end
    end
  end
end
