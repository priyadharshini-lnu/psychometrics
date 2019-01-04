module Api
  module V1
    class ReportsController < Api::BaseController
      def index
        render json: [:list_reports]
      end
      def results
        render json: [:results]
      end
      def pdf
        render json: [:pdf]
      end
    end
  end
end
