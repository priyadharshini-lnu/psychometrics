# frozen_string_literal: true

module Threesixty
  module ParticipatableByCriteria < Base
    class ByRelationship
      private

      def user_matches_criteria?(user)
        criteria_list.all? do |criteria|
          participatable_relationships[user.id].include?(criteria['value'])
        end
      end

      def participatable_relationships
        @participatable_relationships ||= threesixty_campaign.
          participants.
          group(:subject_id).
          select('subject_id, array_agg(relationship_id) as relationship_ids').
          each_with_object({}) do |participant, acc|
            acc[participant.subject_id] = acc[participant.relationship_ids]
          end
      end
    end
  end
end
