# frozen_string_literal: true

module Threesixty
  module Subjects
    class IsNominationRequirementComplete < BaseCommand
      attr_reader :threesixty_campaign, :user

      def initialize(threesixty_campaign, user)
        @threesixty_campaign = threesixty_campaign
        @user = user
      end

      def call
        nomination_requirement = Threesixty::NominationRequirements::FindForUsers.call!(
          threesixty_campaign,
          user
        )[user.id]

        braodcast :ok, true unless nomination_requirement

        subject_evaluator_counters = ::Threesixty::Subjects::CalcSubjectEvaluatorsCounters.call!(
          [user.id],
          threesixty_campaign
        )

        braodcast :ok, Threesixty::NominationRequirements::IsValid.call!(
          nomination_requirement,
          subject_evaluator_counters.dig(user.id, :completed)
        )
      end
    end
  end
end
