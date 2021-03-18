# frozen_string_literal: true

module AgileScoring
  class Base
    def calculate(question, answer, factor_scoring)
      (question['answers'] & [answer['answers']]).empty? ? 0 : factor_scoring['itemScore']
    end
  end
end
