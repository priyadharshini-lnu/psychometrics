# frozen_string_literal: true

module Threesixty
  module Subjects
    class GetEvaluatorsForEvaluatorsReminder
      attr_reader :threesixty_campaign, :evaluators

      def initialize(threesixty_campaign)
        @threesixty_campaign = threesixty_campaign
        @evaluators = Threesixty::Evaluator.where(campaign_id: threesixty_campaign.campaign_id).includes(:user)
      end

      def call
        subject_evaluator_counters = ::Threesixty::Subjects::CalcSubjectEvaluatorsCounters.call!(
          evaluators.map(&:user_id),
          threesixty_campaign
        )
        nomination_requirement_by_user_id = ::Threesixty::NominationRequirements::FindForUsers.call!(
          evaluators.map(&:user),
          threesixty_campaign
        )
        valid_statuses =[Threesixty::Participants::GetStatus::COMPLETED, Threesixty::Participants::GetStatus::DONE]

        evaluators.select do |subject|
          nomination_requirement[subject.user_id]
          status = Threesixty::Participants::GetStatus.call!(
            subject,
            nomination_requirement_by_user_id[subject.user_id],
            subject_evaluator_counters[subject.user_id]
          )
          valid_statuses.include?(status)
        end
      end
    end
  end
end