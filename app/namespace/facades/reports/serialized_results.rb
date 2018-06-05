module Facades
  module Reports
    class SerializedResults
      attr_reader :results

      def initialize(assigns, membership)
        @results = serialize_assigns(assigns, membership)
      end

      private

      def serialize_assigns(assigns, membership)
        assigns.group_by(&:assessment_id).transform_values do |group|
          group.map { |a| ::AssignSerializer.new(a, membership: membership) }
        end.to_json
      end
    end
  end
end
