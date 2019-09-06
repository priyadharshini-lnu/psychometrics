# frozen_string_literal: true

module Threesixty
  module Evaluators
    class SearchQuery < Rectify::Query
      include Rectify::SqlQuery

      LIMIT = 3

      def initialize(campaign, subject, q)
        @subject = subject
        @campaign = campaign
        @options = @campaign.threesixty_campaign.option
        @q = "%#{q}%"
      end

      def query
        users = super
        if limit_nomination_by_subject_to_anyone_in_assessment?
          users = users.select do |user|
            Threesixty::Evaluators::ResolveEvaluatorCriteria.call!(campaign, user, criteria, subject.user)
          end
        end
        if can_nominate_anyone_from_datasheet?
          users = users.concat(SearchInDatasheetQuery.new(@campaign, @subject, @q).query)
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
        { project_id: campaign.project.id, campaign_id: campaign.id, query: q, limit: LIMIT }
      end

      private

      def can_nominate_anyone_from_datasheet?
        @options.participants.dig('subject', 'can_nominate_anyone_from_datasheet')
      end

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
