# frozen_string_literal: true

module Administration
  module Campaigns
    class DatasheetsController < Administration::Campaigns::BaseController
      include Administration::DatasheetManagement

      private

      def datasheet
        @datasheet ||= campaign.campaign_datasheet
      end

      def set_resource
        datasheet
      end

      def parent_resource
        campaign
      end
    end
  end
end
