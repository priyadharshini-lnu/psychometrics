# frozen_string_literal: true

module AgileScoring
  class Base
    def calculate(question, answer, factor_scoring)
      question['answers'].intersect?([answer['answers']]) ? factor_scoring['itemScore'] : 0
    end
  end
end
