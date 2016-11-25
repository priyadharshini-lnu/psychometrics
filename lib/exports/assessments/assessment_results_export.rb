module Exports
  module Assessments
    class AssessmentResultsExport
      QUESTIONS = %w(ConstantSum GapAnalysis GraphicSlider HotSpot
                     MatrixTable MetaInfo MultipleChoice PickGroupRank
                     RankOrder SideBySide Slider TextEntry Timing).freeze

      def initialize(assessment_id, client_id)
        @package = Axlsx::Package.new
        wb = @package.workbook
        wb.add_worksheet(name: 'AssessmentRawResults') do |sheet|
          questions = Question.
                      joining { block }.
                      not_deleted.
                      selecting { [id, name, type, props] }.
                      where.has { |q| q.block.assessment_id == assessment_id }.
                      ordering { [block.position.asc, position.asc] }

          ## header
          header = ['Result ID', 'Name', 'Email', 'Started At', 'Completed At']
          questions.each do |question|
            next unless QUESTIONS.include?(question.type)
            parser = "Exports::Assessments::Questions::#{question.type}".constantize
            header << parser.header(question)
          end

          sheet.add_row header.flatten

          ::Assign.
            selecting { [id,
                         results,
                         status,
                         completed_at,
                         started_at,
                         membership.user.last_name.op('||', quoted(', ')).op('||', membership.user.first_name).as('user_name'),
                         membership.user.email.as('user_email')] }.
            joining { membership.user }.
            where.has { membership.client_id.eq(client_id) }.
            where(assessment_id: assessment_id).
            find_each(batch_size: 100) do |assign|
            # Collect parsed answers
            user_results = []
            if assign.results
              questions.each do |question|
                answers = assign.results[question.id.to_s].try(:[], 'answers')
                next unless QUESTIONS.include?(question.type)
                parser = "Exports::Assessments::Questions::#{question.type}".constantize
                user_results << parser.result(answers, question)
              end
            end

            sheet.add_row [assign.encode_id,
                           assign.user_name,
                           assign.user_email,
                           assign.started_at.try(:strftime, '%D %r'),
                           assign.completed_at.try(:strftime, '%D %r'),
                           *user_results.flatten]
          end
        end
      end

      def render
        @package
      end
    end
  end
end
