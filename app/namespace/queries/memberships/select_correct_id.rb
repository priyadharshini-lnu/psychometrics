module Queries
  module Memberships
    class SelectCorrectId < ::Queries::Base
      def initialize(relation = Membership.all)
        @relation = relation
      end

      def call(communication)
        @relation.where(id: communication.current_memberships_ids)
          .select('coalesce(memberships.project_membership_id, memberships.id) as final_id')
      end
    end
  end
end
