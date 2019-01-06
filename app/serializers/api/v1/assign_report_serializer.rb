module Api
  module V1
    class AssignReportSerializer < ActiveModel::Serializer
      attributes :id, :name, :status, :assessments
      def status
        :will_be_added_later
      end

      def id
        object.report.id
      end

      def name
        object.report.name
      end

      def assessments
        # TODO (atanych): should be has_many assessments
        [Api::V1::AssignSerializer.new(object.assign)]
      end
    end
  end
end
