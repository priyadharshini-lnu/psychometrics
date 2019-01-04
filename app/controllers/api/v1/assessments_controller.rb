module Api
  module V1
    class AssessmentsController < Api::BaseController
      def index
        render json: Assessment.all.limit(5).map { |a| Api::V1::AssessmentSerializer.new(a) }
      end
    end
  end
end
