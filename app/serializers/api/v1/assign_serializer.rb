module Api
  module V1
    class AssignSerializer < ActiveModel::Serializer
      attributes :id, :name, :status
      def name
        object.assessment.name
      end
    end
  end
end
