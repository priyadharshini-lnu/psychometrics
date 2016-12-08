module Exports
  module Assessments
    module Questions
      class PickGroupRank
        # FROM:
        #   [{
        #     "scale": 0,  - Group ID
        #     "value": 0,  - Rank in Group
        #     "choice": 0  - Item ID
        #   }, ...]
        # TO:
        #      G1         G2      Groups items rank
        #   ['1,2,3',   '4,5',   1, 2, 3,   4,5]
        def self.result(answers, question)
          parsed_result = []
          question.props['scalePoints'].to_i.times do |s|
            parsed_result << (answers || []).
                             select { |answer| answer['scale'] == s }.
                             sort_by { |answer| answer['value'] }.
                             map { |answer| answer['choice'] + 1 }.
                             join(', ')
          end
          question.props['scalePoints'].to_i.times do |s|
            question.props['choices'].to_i.times do |c|
              parsed_result << (answers || []).
                               select { |answer| answer['scale'] == s && answer['choice'] == c }.
                               map { |a| a['value'] + 1 }.
                               join(', ')
            end
          end
          parsed_result
        end

        # Parse HEADER data for XLSX
        def self.header(question)
          parsed_header = []
          question.props['scalePoints'].to_i.times do |s|
            parsed_header << "QID#{question.id}_#{s + 1}_GROUP"
          end
          question.props['scalePoints'].to_i.times do |s|
            question.props['choices'].to_i.times do |c|
              parsed_header << "QID#{question.id}_#{s + 1}_#{c + 1}_RANK"
            end
          end
          parsed_header
        end
      end
    end
  end
end
