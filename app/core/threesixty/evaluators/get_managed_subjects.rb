# frozen_string_literal: true

module Threesixty
  module Evaluators
    class GetManagedSubjects < Rectify::Query
      private_attr_reader :threesixty_campaign, :option, :user

      def initialize(threesixty_campaign, user)
        @threesixty_campaign = threesixty_campaign
        @option = threesixty_campaign.option
        @user = user
      end

      def query
        threesixty_campaign.subjects.where(user_id: managed_subject_ids)
      end

      def managed_subject_ids
        managed_subjects = threesixty_campaign.participants.joins(:relationship)
          .where(relationships: { name: 'Manager', type: :global })
          .where(evaluator_id: user.id)
          .where.not(subject_id: user.id, manager_nomination_status: :denied)
          .pluck(:subject_id)
      end
    end
  end
end