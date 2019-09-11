# frozen_string_literal: true

module Threesixty
  module ParticipatorByCriteria
    class ByDatasheetFields < Base
      private

      def user_matches_criteria?(user, criteria)
        return unless (datasheet_row = datasheet_rows[user.email])

        datasheet_row.data[criteria['sub_field']]&.downcase == criteria['value']&.downcase
      end

      def datasheet_rows
        @datasheet_rows ||= threesixty_campaign.datasheet&.
          rows&.
          where(email: participator_emails)&.
          index_by(&:email) || {}
      end

      def participator_emails
        participators.map(&:email)
      end
    end
  end
end
