module Scoring
  class TextEntry

    def calculate(_question, result, scoring_template)
      values = []
      result['answers'].each do |answer|
        if answer['value']
          object = scoring_template.find { |template| template['index'] == answer['value'] }
          values << object['value'] if object
        end
      end
      return values.sum.to_f / values.size unless values.empty?
      nil
    end
  end
end
