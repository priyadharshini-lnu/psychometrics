# frozen_string_literal: true

module Threesixty
  module ParticipatableByCriteria
    class ByRelationship < Base
      private

      def user_matches_criteria?(user)
        criteria_list.all? do |criteria|
          participatable_relationships[user.id].include?(criteria['value'])
        end
      end

      def participatable_relationships
        @participatable_relationships ||= threesixty_campaign.
          participants.
          group(id_column).
          where("#{id_column}" => user_ids).
          select("#{id_column}, array_agg(relationship_id) as relationship_ids").
          each_with_object({}) do |participant, acc|
            acc[participant.subject_id] = participant.relationship_ids
          end
      end

      def id_column
        "#{participatable_types}_id"
      end
    end
  end
end
