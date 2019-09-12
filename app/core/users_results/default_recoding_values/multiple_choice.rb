# frozen_string_literal: true

module UsersResults
  module DefaultRecodingValues
    class MultipleChoice < Base
      def perform
        (0...question.props['choices']).map { |i| { 'index' => i, 'value' => i + 1 } }
      end
    end
  end
end
