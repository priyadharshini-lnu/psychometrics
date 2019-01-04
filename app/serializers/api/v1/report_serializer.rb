module Api
  module V1
    class ReportSerializer < ActiveModel::Serializer
      attributes :id, :name, :status, :assessment_ids
      def assessment_ids
        [1, 2]
      end
      def status
        :any
      end
    end
  end
end
