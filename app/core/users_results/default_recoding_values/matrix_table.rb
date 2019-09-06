module UsersResults
  module DefaultRecodingValues
    class MatrixTable < Base
      def perform
        (0...question.props['choices']).map do |choice|
          (0...question.props['scalePoints']).map { |sc| { 'scale' => sc, 'value' => sc + 1, 'choice' => choice } }
        end.flatten
      end
    end
  end
end
