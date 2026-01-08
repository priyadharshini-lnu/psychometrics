# frozen_string_literal: true

module Idp
  module DevelopmentAction
    class OrderByTagsQuery < Rectify::Query
      private_attr_reader :base_relation, :tags, :limit

      def initialize(development_actions, tags, limit: 5)
        @base_relation = development_actions
        @tags = tags
        @limit = limit
      end

      def query
        return base_relation.limit(limit) if tags.empty?

        matching = base_relation.tagged_with(tags, any: true, order_by_matching_tag_count: true)
        matching_ids = matching.pluck(:id)

        non_matching = base_relation.where.not(id: matching_ids)

        matching_results = matching.limit(limit).to_a

        if matching_results.length < limit
          remaining_limit = limit - matching_results.length
          non_matching_results = non_matching.limit(remaining_limit).to_a
          matching_results + non_matching_results
        else
          matching_results
        end
      end
    end
  end
end
