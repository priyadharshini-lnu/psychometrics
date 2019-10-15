# frozen_string_literal: true

module Threesixty
  module Evaluators
    class GetSubjectIdsWithoutEvaluation < BaseCommand
      private_attr_reader :threesixty_campaign, :option, :user

      def initialize(threesixty_campaign, user)
        @threesixty_campaign = threesixty_campaign
        @option = threesixty_campaign.option
        @user = user
      end

      def call
        evaluation_completed_for_subject = user.
                                           evaluation_results.
                                           completed.
                                           actual_by_options(threesixty_campaign.option).
                                           pluck(:subject_id)

        all_subjects = threesixty_campaign.participants.where(evaluator_id: user.id).
                       where('subject_id != evaluator_id').
                       where.not(evaluator_nomination_status: :declined)

        if option.participants.dig('manager', 'can_approve_nominations')
          all_subjects = all_subjects.where(manager_nomination_status: :approved)
        end

        broadcast :ok, all_subjects.pluck(:subject_id) - evaluation_completed_for_subject
      end
    end
  end
end
