module Scoring
  class SideBySide

    def calculate(_question, result, scoring_template)
      values = []
      result['answers'].each do |answer|
        if answer['values'] && !answer['values'].empty?
          object = scoring_template.find { |template| template['scale'] == answer['scale'] && template['choice'] == answer['choice'] }
          if object && object['values']
            answer['values'].each do |inner_result|
              inner_object = object['values'].find { |template| template['index'] == inner_result['index'] }
              values << inner_object['value'] if inner_object
            end
          end
        end
      end
      return values.sum.to_f / values.size unless values.empty?
      nil
    end
  end
end
