# frozen_string_literal: true

module Administration
  module Campaigns
    class SheetsController < Administration::Campaigns::BaseController
      include Administration::SheetManagement

      def datasheet_columns
        columns = campaign.datasheet_column_records
        render json: Panko::ArraySerializer.new(columns,
                                                each_serializer: ::Administration::SheetColumnSerializer).to_a
      end

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
