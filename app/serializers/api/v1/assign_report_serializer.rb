module Api
  module V1
    class AssignReportSerializer < ActiveModel::Serializer
      attributes :id, :name, :status, :assessments
      def id
        object.report.id
      end

      def name
        object.report.name
      end

      def assessments
        object.report.assessment_ids.map do |id|
          assign = instance_options[:assigns][id]
          assign ? Api::V1::AssignSerializer.new(assign.project_assign).to_h : nil
        end.compact
      end
    end
  end
end
