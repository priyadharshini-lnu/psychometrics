# frozen_string_literal: true

module Threesixty
  module Evaluators
    class SearchQuery < Rectify::Form
      include Rectify::SqlQuery

      LIMIT = 3

      def initialize(campaign, q)
        @campaign = campaign
        @q = "%#{q}%"
      end

      def model
        User
      end

      def sql
        <<-SQL.strip_heredoc
        SELECT users.id, users.email, users.first_name, users.last_name
        FROM threesixty_evaluators
        JOIN users on users.id = threesixty_evaluators.user_id
        WHERE campaign_id = :campaign_id AND (users.email ILIKE :query OR users.first_name ILIKE :query OR users.last_name ILIKE :query)
        LIMIT :limit
        SQL
      end

      def params
        { campaign_id: campaign.id, query: q, limit: LIMIT }
      end

      private

      attr_reader :campaign, :q
    end
  end
end
