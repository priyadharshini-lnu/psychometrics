module Exports
  module Assessments
    class AssessmentResultsExport
      QUESTIONS = %w(ConstantSum GapAnalysis GraphicSlider HotSpot
                     MatrixTable MetaInfo MultipleChoice PickGroupRank
                     RankOrder SideBySide Slider TextEntry Timing).freeze

      def initialize(assessment_id, client_id, options = {})
        # Try convert raw reslults to scoring
        @scoring = !!options[:scoring]
        @package = Axlsx::Package.new
        wb = @package.workbook
        wb.add_worksheet(name: 'AssessmentRawResults') do |sheet|
          questions = Question.
                      joining { block }.
                      not_deleted.
                      includes(:factors_scorings).
                      selecting { [id, name, type, props] }.
                      where.has { |q| q.block.assessment_id == assessment_id }.
                      ordering { [block.position.asc, position.asc] }
          ## header
          header = {
            header: ['Result ID', 'Name', 'Email', 'Started At', 'Completed At', 'Norm Data', 'Status'],
            header2: ['', '', '', '', '', '', ''],
            header3: ['', '', '', '', '', '', '']
          }
          questions.each do |question|
            next unless QUESTIONS.include?(question.type)
            parser = "Exports::Assessments::Questions::#{question.type}".constantize
            question_header = parser.header(question)
            header[:header] << question_header
            header[:header2] << Array.new(question_header.size) { |_i| question.name }
            header[:header3] << Array.new(question_header.size) { |_i| ActionView::Base.full_sanitizer.sanitize(question.props['questionText']) }
          end
          sheet.add_row header[:header].flatten
          sheet.add_row header[:header2].flatten
          sheet.add_row header[:header3].flatten
          ::Assign.
            selecting { [id,
                         results,
                         norm_data,
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
                user_results << parser.result(answers, question, @scoring)
              end
            end

            norm_data = export_norm(assign.norm_data)

            sheet.add_row [assign.encode_id,
                           assign.user_name,
                           assign.user_email,
                           assign.started_at.try(:strftime, '%D %r'),
                           assign.completed_at.try(:strftime, '%D %r'),
                           norm_data,
                           I18n.t("activerecord.attributes.assign.statuses.#{assign.status}"),
                           *user_results.flatten]
          end
        end
      end

      def render
        @package
      end

      private
      
      def export_norm(norm_data)
        return if norm_data.nil? || norm_data['id'].nil?
        norm = Norm.find(norm_data['id'])
        "#{norm.name}:#{norm_data['type']}"
      rescue ActiveRecord::RecordNotFound
      end
    end
  end
end
