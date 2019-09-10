# frozen_string_literal: true

module Queries
  module Assessments
    class ByClientSubtree < ::Queries::Base
      def initialize(relation = Assessment.all)
        @relation = relation
      end

      def call(client)
        @relation.joins(reports: [:clients_reports]).where(clients_reports: { client_id: client.subtree_ids }).
          select('DISTINCT ON (assessments.id) assessments.*')
      end
    end
  end
end
