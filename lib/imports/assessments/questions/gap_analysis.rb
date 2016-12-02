module Imports
  module Assessments
    module Questions
      class GapAnalysis
        # FROM: [2, '1,2']
        #   Where index of array - choice, value - scale or why
        # TO:
        # {
        #   scale: 1,
        #   choice: 0,
        #   values: [0,1]
        # }
        def self.build_answers(data, question)
          answers = []
          data.each_slice(2).each_with_index do |batch, choice|
            scale, values = batch # contain scale and values
            next if scale.nil?
            answers << {
              scale: scale - 1,
              choice: choice,
              values: values && values.to_s.split(',').map(&:to_i) || []
            }
          end
          return nil if answers.blank?
          {
            answers: answers,
            question_id: question.id
          }
        end
      end
    end
  end
end
