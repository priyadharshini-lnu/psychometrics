# frozen_string_literal: true

module Queries
  module Memberships
    class ForCommunication < ::Queries::Base
      def initialize(relation = Membership.all)
        @relation = relation
      end

      def call(communication)
        @relation = @relation.where(client_id: communication.end_level.subtree_ids).joins(:client).
                    where(clients: { end_level: true })
        @relation = @relation.where(user_id: communication.user_ids) if communication.selected_recipients?
        @relation.member_or_manager
      end
    end
  end
end
