# frozen_string_literal: true

module Threesixty
  module Subjects
    class Serialize < BaseCommand
      def initialize(subjects, threesixty_campaign, current_user)
        @subjects = subjects
        @threesixty_campaign = threesixty_campaign
        @current_user = current_user
      end

      def call
        counters = Threesixty::Participants::CalcCounters.call!(subjects.map(&:user_id), threesixty_campaign)
        subject_evaluator_counters = Threesixty::Subjects::CalcSubjectEvaluatorsCounters.call!(
          subjects.map(&:user_id),
          threesixty_campaign
        )

        nomination_requirement_by_user_id = ::Threesixty::NominationRequirements::FindForUsers.call!(
          subjects.map(&:user),
          threesixty_campaign
        )
        result = subjects.map do |subject|
          ::Threesixty::SubjectSerializer.new(
            context: {
              option: threesixty_campaign.option,
              counters: counters,
              nomination_requirement: nomination_requirement_by_user_id[subject.user_id],
              subject_evaluator_counters: subject_evaluator_counters,
              current_user: current_user,
              project_id: threesixty_campaign.campaign.project_id,
              campaign_id: threesixty_campaign.campaign_id
            }
          ).serialize(subject)
        end
        broadcast :ok, result
      end

      private

      attr_reader :subjects, :threesixty_campaign, :current_user
    end
  end
end
