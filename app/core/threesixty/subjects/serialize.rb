# frozen_string_literal: true

module Threesixty
  module Subjects
    class Serialize < BaseCommand
      def initialize(subjects, threesixty_campaign)
        @subjects = subjects
        @threesixty_campaign = threesixty_campaign
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
            subject,
            option: threesixty_campaign.option,
            counters: counters,
            nomination_requirement: nomination_requirement_by_user_id[subject.user_id],
            subject_evaluator_counters: subject_evaluator_counters
          ).to_h
        end
        broadcast :ok, result
      end

      private

      attr_reader :subjects, :threesixty_campaign
    end
  end
end
