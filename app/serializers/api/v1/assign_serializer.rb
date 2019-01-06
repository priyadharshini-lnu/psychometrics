module Api
  module V1
    class AssignSerializer < ActiveModel::Serializer
      attributes :id, :name, :status, :created_at, :updated_at
      def id
        object.assessment.id
      end
      def name
        object.assessment.name
      end
    end
  end
end
