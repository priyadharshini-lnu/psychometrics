# frozen_string_literal: true

module AgileScoring
  class Slider < Base
    def calculate(_, answer, factor_scoring)
      answer['answers'][0].to_f * factor_scoring['itemScore']
    end
  end
end
