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
          SELECT sheet_rows.id, sheet_rows.email, "data"->>'First Name' as first_name, "data"->>'Last Name' as last_name
            FROM sheet_rows
            JOIN sheets on sheets.id = sheet_rows.sheet_id and (
              sheets.project_id = :project_id OR sheets.campaign_id = :campaign_id
            )
            WHERE sheets.type = 'Datasheet'
            AND sheet_rows.email ILIKE :query OR "data"->>'First Name' ILIKE :query OR "data"->>'Last Name' ILIKE :query
          LIMIT :limit
        SQL
      end

      def params
        { project_id: campaign.project.id, campaign_id: campaign.id, query: q, limit: LIMIT }
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
