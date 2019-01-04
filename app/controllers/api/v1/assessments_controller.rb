module Api
  module V1
    class AssessmentsController < Api::BaseController
      def index
        render json: [:list_assessments]
      end
    end
  end
end
