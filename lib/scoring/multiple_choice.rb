module Scoring
  class MultipleChoice

    def calculate(_question, result, scoring_template)
      values = []

      result['answers'].each do |answer|
        if answer['value'] && result['not_applicable'] != true
          object = scoring_template.find { |template| template['index'] == answer['index'] }
          values << object['value'] if object
        end
      end
      value = values.empty? ? nil : values.sum.to_f / values.size
      { value: value, options: [] }
    end
  end
end
