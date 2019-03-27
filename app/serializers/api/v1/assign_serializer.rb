module Api
  module V1
    class AssignSerializer < ActiveModel::Serializer
      attributes :id, :name, :status, :started_at, :completed_at
      def id
        object.assessment.id
      end

      def name
        object.assessment.name
      end
    end
  end
end
