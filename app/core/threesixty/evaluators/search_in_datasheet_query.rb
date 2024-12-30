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
        <<-SQL.squish
          SELECT sheet_rows.id, sheet_rows.email, row_data."First Name" as first_name, row_data."Last Name" as last_name
            FROM sheet_rows
            LEFT JOIN (#{crosstab_query}) as row_data on sheet_rows.id = row_data.sheet_row_id
            JOIN sheets on sheets.id = sheet_rows.sheet_id and (
              sheets.project_id = :project_id OR sheets.campaign_id = :campaign_id
            )
            WHERE sheets.type = 'Datasheet' and (
              (sheet_rows.email ILIKE :query) or
              (row_data."First Name" ILIKE :query) or
              (row_data."Last Name" ILIKE :query)
            )
          LIMIT :limit
        SQL
      end

      def crosstab_query
        <<~SQL.squish
          SELECT * FROM crosstab(
            $$
              SELECT srd.sheet_row_id, sheet_columns.name, srd.string_value
              FROM sheet_row_data srd
              LEFT JOIN sheet_columns on sheet_columns.id = srd.sheet_column_id
              LEFT JOIN sheet_rows on sheet_rows.id = srd.sheet_row_id
              JOIN sheets on sheets.id = sheet_rows.sheet_id and (
                sheets.project_id = :project_id OR sheets.campaign_id = :campaign_id
              )
              where sheet_columns.name in ('First Name', 'Last Name')
              ORDER BY 1
            $$,
            $$
              VALUES ('First Name'), ('Last Name')
            $$
          ) AS final_result(sheet_row_id BIGINT, "First Name" TEXT, "Last Name" TEXT)
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
