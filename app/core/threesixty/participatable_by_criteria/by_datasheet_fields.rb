# frozen_string_literal: true

module Threesixty
  module ParticipatableByCriteria
    class ByDatasheetFields < Base
      private

      def user_matches_criteria?(user)
        criteria_list.all? do |criteria|
          if datasheet_row = datasheet_rows[user.email]
            datasheet_row.data[criteria['sub_field']] == criteria['value']
          end
        end
      end

      def datasheet_rows
        @datasheet_row_data ||= threesixty_campaign.datasheet&.
          rows&.
          where(email: participatable_emails)
          .index_by(&:email)
      end

      def participatable_emails
        participatables.map { |participatable| participatable.email }
      end
    end
  end
end
