module Scoring
  class MultipleChoice
    def initialize
    end

    def calculate(question, result, scoring_template)
      puts "question #{question.inspect}"
      puts "result #{result}"
      puts "scoring_template #{scoring_template.inspect}"
      puts "---------------------------------"
      values = []
      result['answers'].each do |answer|
        if answer['value']
          object = scoring_template.props.find { |template| template['index'] == answer['index'] }
          values << object['value'] if object
        end
      end
      puts "merge #{result['answers']} with #{scoring_template.props}"
      puts "values #{values}"
      if values.size > 0
        values.inject { |sum, el| sum + el }.to_f / values.size
      else
        nil
      end
    end
  end
end
