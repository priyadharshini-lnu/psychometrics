module Api
  module V1
    class ReportsController < Api::ProjectScopeController
      def index
        render json: Report.all.limit(5).map { |r| Api::V1::ReportSerializer.new(r) }
      end
      def results
        render json: { any: :any }
      end
      def pdf
        render json: { url: 's3.amazon.com/uri', status: 'ready' }
      end
    end
  end
end
