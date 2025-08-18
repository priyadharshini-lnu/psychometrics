# frozen_string_literal: true

module AI
  module Utils
    module DependencyParser
      class Assessment < Base
        def parse
          ensure_dependency_configured!(
            dependency: 'assessments',
            condition: dependency_assessments.present?,
            error_message: I18n.t(
              'administration.ai_assistants.artifacts.parsers.assessment.no_assessments_configured_for_artifact'
            )
          )

          result = Helpers::AssessmentDependencyDataCollector.call(dependency_assessments, user)

          if result[:error]
            add_error(result[:error])
            raise_errors_if_any('Assessments')
          end

          collected_data = result[:ok]
          raise_errors_if_any('Assessments')

          format_assessments_output(collected_data)
        end

        private

        def format_assessments_output(collected_data)
          if collected_data.empty?
            return "<assessments>#{I18n.t(
              'administration.ai_assistants.artifacts.parsers.assessment.no_valid_assessment_data'
            )}</assessments>"
          end

          assessments_xml = collected_data.map do |data|
            format_assessment_xml(data)
          end.join("\n")

          "<assessments>\n#{assessments_xml}\n</assessments>"
        end

        def format_assessment_xml(data)
          assessment = data[:assessment]
          questions_data = data[:questions_data] || []

          questions_content = questions_data.map do |question|
            format_question_xml(question)
          end.join("\n")

          <<~ASSESSMENT.strip
            <assessment>
              <id>#{assessment[:id]}</id>
              <name>#{assessment[:name]}</name>
              <type>#{assessment[:type]}</type>
              <category>#{assessment[:category]}</category>
              <questions>
            #{questions_content}
              </questions>
            </assessment>
          ASSESSMENT
        end

        def format_question_xml(question)
          options_content = format_question_options_xml(question[:options])

          <<~QUESTION
                  <question>
                    <id>#{question[:id]}</id>
                    <name>#{question[:name]}</name>
                    <type>#{question[:type]}</type>
                    <text>#{question[:question_text]}</text>
            #{options_content}
                    <user_answer>#{question[:user_answer]}</user_answer>
                  </question>
          QUESTION
        end

        def format_question_options_xml(options)
          return '' if options.blank?

          case options
            when Array
              options_xml = options.map.with_index do |option, index|
                "        <option index=\"#{index}\">#{option}</option>"
              end.join("\n")

              <<~OPTIONS.strip
                        <options>
                #{options_xml}
                        </options>
              OPTIONS
            else
              # Fallback for non-array options
              "      <options>#{options}</options>"
          end
        end

        def dependency_assessments
          @dependency_assessments ||= begin
            questions_by_assessment = campaign_assistant_artifact.questions.includes(:assessment).group_by(&:assessment)

            questions_by_assessment.map do |assessment, questions|
              {
                'id' => assessment.id,
                'questions' => questions.map(&:id)
              }
            end
          end
        end
      end
    end
  end
end
