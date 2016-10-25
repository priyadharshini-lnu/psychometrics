module Scoring
  class MatrixTable

    def calculate(_question, result, scoring_template)
      values = []
      result['answers'].each do |answer|
        if answer['value']
          object = scoring_template.find { |template| template['scale'] == answer['scale'] && template['choice'] == answer['choice'] }
          values << object['value'] if object
        end
      end
      return values.sum.to_f / values.size unless values.empty?
      nil
    end
  end
end
