# frozen_string_literal: true

module Threesixty
  module Evaluators
    class GetManagedSubjectsQuery < Rectify::Query
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
        threesixty_campaign.participants.
          where(relationship_id: Relationship.manager_relationship.id).
          where(evaluator_id: user.id).
          where.not(subject_id: user.id, manager_nomination_status: :denied).
          pluck(:subject_id)
      end
    end
  end
end
