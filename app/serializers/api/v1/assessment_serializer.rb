module Api
  module V1
    class AssessmentSerializer < ActiveModel::Serializer
      attributes :id, :name, :status

    end
  end
end
