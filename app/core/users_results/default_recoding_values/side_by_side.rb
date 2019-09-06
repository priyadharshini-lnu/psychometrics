module UsersResults
  module DefaultRecodingValues
    class SideBySide < Base
      def perform
        (0...question.props['choices']).map do |choice|
          (0...question.props['scalePoints']).map do |sc|
            values = (0...question.props['columnsData'][sc]['answers']).map { |a| { 'index' => a, 'value' => a + 1 } }
            { 'scale' => sc, 'values' => values, 'choice' => choice }
          end
        end.flatten
      end
    end
  end
end
