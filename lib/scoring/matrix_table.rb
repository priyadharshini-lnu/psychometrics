module Scoring
  class MatrixTable

    def calculate(_question, result, scoring_template)
      values = []
      options = []
      result['answers'].each do |answer|
        if answer['value']
          object = scoring_template.detect { |template| template['scale'] == answer['scale'] && template['choice'] == answer['choice'] }
          if object
            values << object['value']
            options << { choice: answer['choice'], value: object['value'] }
          end
        end
      end
      value = values.empty? ? nil : values.sum.to_f / values.size
      { value: value, options: options }
    end
  end
end
