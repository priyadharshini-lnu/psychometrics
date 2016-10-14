module Scoring
  class MultipleChoice
    def initialize
    end

    def calculate(question, result, scoring_template)
      values = []
      result['answers'].each do |answer|
        if answer['value']
          object = scoring_template.props.find { |template| template['index'] == answer['index'] }
          values << object['value'] if object
        end
      end
      return values.sum.to_f / values.size if values.size > 0
      nil
    end
  end
end
