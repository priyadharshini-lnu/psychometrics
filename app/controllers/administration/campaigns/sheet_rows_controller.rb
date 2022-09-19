# frozen_string_literal: true

module Administration
  module Campaigns
    class SheetRowsController < Administration::Campaigns::BaseController
      include Administration::SheetRowManagement

      prepend_before_action :set_resource_class
      before_action :set_resource, only: %i[show update]

      private

      def sheet
        @sheet ||= campaign.sheets.find_by(type: params[:type])
      end

      def parent_resource
        campaign
      end
    end
  end
end
