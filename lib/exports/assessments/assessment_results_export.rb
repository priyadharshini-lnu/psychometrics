# frozen_string_literal: true

module Exports
  module Assessments
    class AssessmentResultsExport
      QUESTIONS = %w[ConstantSum GapAnalysis GraphicSlider HotSpot
                     MatrixTable MetaInfo MultipleChoice PickGroupRank
                     RankOrder SideBySide Slider TextEntry Timing].freeze

      def initialize(assessment, client_id, options = {})
        @assessment = assessment
        @client_id = client_id
        @scoring = !!options[:scoring]
        @external = !!options[:external]
      end

      def to_xlsx
        if @external
          Exports::External::BaseExternalExport.build(Assessment::TYPES.key(@assessment.type)).
            to_xlsx(current_level_assigns)
        else
          to_xlsx_common
        end
      end

      # TODO: (atanych): should be refactored
      # rubocop:disable Metrics/BlockLength, Metrics/AbcSize
      def to_xlsx_common
        Axlsx::Package.new do |package|
          package.workbook.add_worksheet(name: 'AssessmentRawResults') do |sheet|
            questions = Question.
                        joining { block }.
                        not_deleted.
                        includes(:factors_scorings).
                        selecting { [id, name, type, props] }.
                        where.has { |q| q.block.assessment_id == @assessment.id }.
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
              header[:header3] << Array.new(question_header.size) do |_i|
                ActionView::Base.full_sanitizer.sanitize(question.props['questionText'])
              end
            end
            sheet.add_row header[:header].flatten
            sheet.add_row header[:header2].flatten
            sheet.add_row header[:header3].flatten
            current_level_assigns.
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
              user_results_flattened = user_results.map { |a| a == [] ? '' : a }.flatten

              sheet.add_row [assign.encode_id,
                             assign.user_name,
                             assign.user_email,
                             assign.started_at.try(:strftime, '%D %r'),
                             assign.completed_at.try(:strftime, '%D %r'),
                             norm_data,
                             I18n.t("activerecord.attributes.assign.statuses.#{assign.status}"),
                             *user_results_flattened]
            end
          end
        end
      end
      # rubocop:enable Metrics/BlockLength, Metrics/AbcSize

      def current_level_assigns
        client = Client.find(@client_id)
        if client.project?
          project_level_assigns
        else
          subproject_level_assigns
        end
      end

      private

      def project_level_assigns
        Queries::Assigns::ProjectLevel::ByClientAndAssessment.call(@client_id, @assessment.id).
          selecting do
          [id,
           results,
           external_results,
           norm_data,
           status,
           completed_at,
           started_at,
           membership.user.last_name.op('||', quoted(', ')).op('||', membership.user.first_name).as('user_name'),
           membership.user.email.as('user_email')]
        end
      end

      def subproject_level_assigns
        Queries::Assigns::SubProjectLevel::ByClientAndAssessment.call(@client_id, @assessment.id).
          selecting do
          [id,
           results,
           external_results,
           norm_data,
           status,
           completed_at,
           started_at,
           original_assign.membership.user.
             last_name.
             op('||', quoted(', ')).
             op('||', original_assign.membership.user.first_name).
             as('user_name'),
           original_assign.membership.user.email.as('user_email')]
        end
      end

      def export_norm(norm_data)
        return if norm_data.nil? || norm_data['id'].nil?

        norm = Norm.find(norm_data['id'])
        "#{norm.name}:#{norm_data['type']}"
      rescue ActiveRecord::RecordNotFound
      end
    end
  end
end
