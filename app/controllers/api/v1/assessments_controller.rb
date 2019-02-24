module Api
  module V1
    class AssessmentsController < BaseController
      def index
        assigns = Assign.includes(:assessment).where(membership: project_membership)
        render json: assigns.map { |a| Api::V1::AssignSerializer.new(a).to_h }
      end
    end
  end
end
