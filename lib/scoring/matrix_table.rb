module Scoring
  class MatrixTable

    def calculate(_question, result, scoring_template)
      values = []
      result['answers'].each do |answer|
        if answer['value']
          object = scoring_template.detect { |template| template['scale'] == answer['scale'] && template['choice'] == answer['choice'] }
          values << object['value'] if object
        end
      end
      value = values.empty? ? nil : values.sum.to_f / values.size
      { value: value, options: [] }
    end
  end
end
