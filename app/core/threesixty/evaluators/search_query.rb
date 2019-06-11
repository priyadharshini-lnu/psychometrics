# frozen_string_literal: true

module Threesixty
  module Evaluators
    class SearchQuery < Rectify::Form
      include Rectify::SqlQuery

      LIMIT = 3

      def initialize(campaign, subject, q)
        @subject = subject
        @campaign = campaign
        @options = @campaign.option
        @q = "%#{q}%"
      end

      def query
        users = super
        if limit_nomination_by_subject_to_anyone_in_assessment?
          users = uses.select do |user|
            Threesixty::Evaluators::ResolveEvaluatorCriteria.call(campaign, user, criteria, subject)
          end
        end
        users
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

      def limit_nomination_by_subject_to_anyone_in_assessment?
        @options.participants.dig('subject', 'limit_nomination_by_subject_to_anyone_in_assessment').present?
      end

      def criteria
        @options.participants.dig('subject', 'limit_nomination_by_subject_to_anyone_criteria')
      end

      attr_reader :campaign, :q, :subject
    end
  end
end
