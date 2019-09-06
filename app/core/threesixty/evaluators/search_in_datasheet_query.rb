# frozen_string_literal: true

module Threesixty
  module Evaluators
    class SearchInDatasheetQuery < Rectify::Query
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
        if limit_nomination_by_subject_from_datasheet?
          users = users.select do |user|
            Threesixty::Evaluators::ResolveEvaluatorCriteria.call!(campaign, user, datasheet_criteria, subject.user)
          end
        end
        users
      end

      def model
        User
      end

      def sql
        <<-SQL.strip_heredoc
          SELECT datasheet_rows.id, datasheet_rows.email, null as first_name, null as last_name
            FROM datasheet_rows
            JOIN datasheets on datasheets.id = datasheet_rows.datasheet_id and datasheets.project_id = :project_id
            WHERE datasheet_rows.email ILIKE :query
          LIMIT :limit
        SQL
      end

      def params
        { project_id: campaign.project.id, query: q, limit: LIMIT }
      end

      private

      def limit_nomination_by_subject_from_datasheet?
        @options.participants.dig('subject', 'limit_nomination_by_subject_from_datasheet')
      end

      def datasheet_criteria
        @options.participants.dig('subject', 'limit_nomination_by_subject_from_datasheet_criteria')
      end

      attr_reader :campaign, :q, :subject
    end
  end
end
