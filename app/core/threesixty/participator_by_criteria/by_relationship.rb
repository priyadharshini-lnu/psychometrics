# frozen_string_literal: true

module Threesixty
  module ParticipatorByCriteria
    class ByRelationship < Base
      private

      def user_matches_criteria?(user, criteria)
        participator_relationships[user.id]&.relationship_ids&.include?(criteria['value'])
      end

      def participator_relationships
        @participator_relationships ||= threesixty_campaign.
                                        participants.
                                        actual_by_options(threesixty_campaign.option).
                                        group(id_column).
                                        where(id_column => user_ids).
                                        select("#{id_column}, array_agg(relationship_id) as relationship_ids").
                                        index_by(&id_column.to_sym)
      end

      def id_column
        "#{participator_type}_id"
      end
    end
  end
end
