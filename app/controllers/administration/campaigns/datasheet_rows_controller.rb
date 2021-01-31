# frozen_string_literal: true

module Administration
  module Campaigns
    class DatasheetRowsController < Administration::Projects::BaseController
      include Administration::DatasheetManagement

      prepend_before_action :set_resource_class
      before_action :set_resource, only: %i[show update]

      private

      def datasheet
        @datasheet ||= campaign.campaign_datasheet
      end
    end
  end
end
