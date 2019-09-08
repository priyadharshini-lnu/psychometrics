# frozen_string_literal: true

module Queries
  module Users
    class MembersSubtreeByClient < ::Queries::Base
      def initialize(relation = User.all)
        @relation = relation
      end

      def call(client)
        @relation.joins(:memberships).where(memberships: { client_id: client.subtree_ids, role: %i[member manager] }).
          distinct
      end
    end
  end
end
