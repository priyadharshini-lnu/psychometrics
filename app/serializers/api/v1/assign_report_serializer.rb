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
        object.report.assessment_ids.map { |id| Api::V1::AssignSerializer.new(instance_options[:assigns][id].project_assign).to_h }
      end
    end
  end
end
