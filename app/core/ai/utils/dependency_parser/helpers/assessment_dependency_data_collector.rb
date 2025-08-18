# frozen_string_literal: true

module AI
  module Utils
    module DependencyParser
      module Helpers
        class AssessmentDependencyDataCollector < BaseCommand
          private_attr_reader :assessments_dependency, :user

          def initialize(assessments_dependency, user)
            @assessments_dependency = assessments_dependency
            @user = user
          end

          def call
            if assessments_dependency.blank?
              return broadcast(
                :error,
                I18n.t('administration.ai_assistants.artifacts.parsers.assessment.no_assessments_configured')
              )
            end

            collected_data = []
            errors = []

            assessments_dependency.each do |assessment_config|
              assessment_id = assessment_config['id']
              question_ids = assessment_config['questions'] || []

              unless assessment_id
                errors << I18n.t('administration.ai_assistants.artifacts.parsers.assessment.assessment_missing_id')
                next
              end

              # Check for completed results first
              users_results = get_users_results_for_assessment(assessment_id)
              if users_results.empty?
                assessment = Assessments::Common.find_by(id: assessment_id)
                assessment_name = assessment&.name || "assessment #{assessment_id}"
                errors << I18n.t('administration.ai_assistants.artifacts.parsers.assessment.no_completed_results',
                                 assessment_name: assessment_name)
                next
              end

              if question_ids.blank?
                errors << I18n.t(
                  'administration.ai_assistants.artifacts.parsers.assessment.assessment_missing_questions',
                  assessment_id: assessment_id
                )
                next
              end

              # Use the most recent result
              users_result = users_results.first
              assessment_data = extract_assessment_data(users_result, question_ids)

              collected_data << assessment_data
            end

            return broadcast(:error, errors.join('; ')) if errors.any?

            broadcast :ok, collected_data
          end

          private

          def get_users_results_for_assessment(assessment_id)
            UsersResult.joins(:user_assessment).
              where(user_assessments: {
                assessment_id: assessment_id,
                subject_id: user.id,
                status: :completed
              }).
              includes(:assessment, assessment: :questions).
              order('user_assessments.completed_at DESC')
          end

          def extract_assessment_data(users_result, question_ids)
            assessment = users_result.assessment
            answers_data = users_result.answers || {}

            filtered_answers = if question_ids.present?
                                 answers_data.select { |question_id, _| question_ids.include?(question_id.to_i) }
                               else
                                 # TODO: May be select all when no question is added
                                 {}
                               end

            # Get question details for the answers we have
            question_ids_in_answers = filtered_answers.keys.map(&:to_i)
            questions_map = assessment.questions.where(id: question_ids_in_answers).index_by(&:id)

            questions_data = filtered_answers.filter_map do |question_id, answer_data|
              question = questions_map[question_id.to_i]
              next unless question # Skip if question not found

              # Only process MultipleChoice and TextEntry questions
              next unless %w[MultipleChoice TextEntry].include?(question.type)

              {
                id: question.id,
                name: question.name,
                type: question.type,
                question_text: extract_question_text(question),
                options: extract_question_options(question),
                user_answer: format_user_answer(answer_data, question)
              }
            end

            {
              assessment: {
                id: assessment.id,
                name: assessment.name,
                type: assessment.type,
                category: assessment.category,
                description: assessment.description
              },
              questions_data: questions_data,
              users_result: {
                id: users_result.id,
                answers: users_result.answers,
                completed_at: users_result.user_assessment&.completed_at
              }
            }
          end

          def extract_question_text(question)
            question.props&.dig('questionText') || question.name || 'No question text available'
          end

          def extract_question_options(question)
            case question.type
              when 'MultipleChoice'
                question.props&.dig('choicesTexts') || []
              when 'TextEntry'
                case question.props&.dig('type')
                  when 'Form'
                    question.props&.dig('choicesTexts') || []
                  else
                    []
                end
              else
                # Only MultipleChoice and TextEntry are supported
                []
            end
          end

          def format_user_answer(answer_data, question)
            return 'No answer provided' unless answer_data&.dig('answers')

            answers = answer_data['answers']

            case question.type
              when 'MultipleChoice'
                format_multiple_choice_answer(answers, question)
              when 'TextEntry'
                format_text_entry_answer(answers, question)
              else
                # Only MultipleChoice and TextEntry are supported
                'Unsupported question type'
            end
          end

          def format_multiple_choice_answer(answers, question)
            return 'No answer selected' if answers.blank?

            choice_texts = question.props&.dig('choicesTexts') || []
            selected_choices = answers.filter_map do |answer|
              next unless answer['value'] == true

              index = answer['index']
              choice_texts[index] || "Choice #{index + 1}"
            end

            selected_choices.join(', ')
          end

          # rubocop:disable Metrics/PerceivedComplexity
          def format_text_entry_answer(answers, question)
            return 'No text provided' if answers.blank?

            if question.props&.dig('type') == 'Form'
              choice_texts = question.props&.dig('choicesTexts') || []
              formatted_answers = answers.filter_map do |answer|
                index = answer['index']
                value = answer['value']
                next if value.blank?

                field_name = choice_texts[index] || "Field #{index + 1}"
                "#{field_name}: #{value}"
              end
              formatted_answers.join('; ')
            else
              answers.filter_map { |answer| answer['value'] }.join('; ')
            end
          end
          # rubocop:enable Metrics/PerceivedComplexity
        end
      end
    end
  end
end
