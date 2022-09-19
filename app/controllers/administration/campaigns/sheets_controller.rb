# frozen_string_literal: true

module Administration
  module Campaigns
    class SheetsController < Administration::Campaigns::BaseController
      include Administration::SheetManagement

      private

      def sheet
        @sheet ||= campaign.sheets.find_by(type: params[:type])
      end

      def set_resource
        sheet
      end

      def parent_resource
        campaign
      end
    end
  end
end
