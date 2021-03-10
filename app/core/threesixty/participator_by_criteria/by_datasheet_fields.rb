# frozen_string_literal: true

module Threesixty
  module ParticipatorByCriteria
    class ByDatasheetFields < Base
      private

      def user_matches_criteria?(user, criteria)
        datasheet_field_data = datasheet_data_indexed_by_email.dig(user.email, criteria['sub_field'])
        return false if datasheet_field_data.nil?

        datasheet_field_data&.to_s&.downcase == criteria['value']&.downcase
      end

      def datasheet_data_indexed_by_email
        @datasheet_data_indexed_by_email ||= ::Campaigns::GetDatasheetData.call!(
          threesixty_campaign.campaign,
          participator_emails
        )
      end

      def participator_emails
        participators.map(&:email)
      end
    end
  end
end
