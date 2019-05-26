module Facades
  module Reports
    class SerializedResults
      attr_reader :results

      def initialize(assigns, membership)
        @results = serialize_assigns(assigns, membership)
      end

      private

      def serialize_assigns(assigns, membership)
        norms = norms_used(assigns)
        assigns.group_by(&:assessment_id).transform_values do |group|
          group.map { |a| ::AssignSerializer.new(a, membership: membership, norm: norms[a.assessment_id]) }
        end.to_json
      end

      def norms_used(assigns)
        norm_ids = assigns.map { |assign| assign.norm_data&.dig('id') }
        norms = Norm.where(id: norm_ids).to_a
  
        assigns.each_with_object({}) do |assign, acc|
          acc[assign.assessment_id] = norms.find { |norm|  assign.norm_data&.dig('id') == norm.id.to_s }&.
            decorate&.display_name
        end.compact
      end
    end
  end
end
