# frozen_string_literal: true

module Threesixty
  module ParticipatableByCriteria
    class ByRelationship < Base
      private

      def user_matches_criteria?(user, criteria)
        participatable_relationships[user.id].include?(criteria['value'])
      end

      def participatable_relationships
        @participatable_relationships ||= threesixty_campaign.
          participants.
          actual_by_options(threesixty_campaign.option).
          group(id_column).
          where("#{id_column}" => user_ids).
          select("#{id_column}, array_agg(relationship_id) as relationship_ids").
          each_with_object({}) do |participant, acc|
            acc[participant.public_send(id_column)] = participant.relationship_ids
          end
      end

      def id_column
        "#{participatable_type}_id"
      end
    end
  end
end
