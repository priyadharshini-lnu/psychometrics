# frozen_string_literal: true

module AI
  module ContentAnalysis
    class PayloadParser
      attr_reader :question, :users_result, :assessment, :user_assessment, :ai_assistant

      def initialize(question, users_result)
        @question = question
        @users_result = users_result
        @user_assessment = users_result.user_assessment
        @assessment = users_result.assessment
        @ai_assistant = assessment.ai_assistant
      end

      def assessment_level_instructions
        prompt = assessment_assistant_prompt
        return nil if prompt.blank?

        <<~INSTRUCTIONS
          <assessment_level_instructions assessment_name="#{assessment.name}">
            #{prompt.strip}
          </assessment_level_instructions>
        INSTRUCTIONS
      end

      def scoring_context
        [
          question_section,
          factors_section,
          candidate_response_section
        ].compact.join("\n\n").strip
      end

      def dependencies
        [
          ai_assistant&.model_id,
          assessment_assistant_prompt,
          scoring_context
        ].join("\n")
      end

      private

      def assessment_assistant_prompt
        assessment.assessment_assistant&.assessment_prompt
      end

      def question_section
        <<~QUESTION.strip
          <question name="#{question.name}">
            #{question_text}
            #{model_answer_section}
            #{keywords_section}
          </question>
        QUESTION
      end

      def question_text
        question.props&.dig('questionText')
      end

      def model_answer_section
        model_answer = question.props&.dig('aiScoringModelAnswer')
        return nil if model_answer.blank?

        "<model_answer>#{model_answer}</model_answer>"
      end

      def keywords_section
        keywords = question.props&.dig('aiScoringKeywords')
        return nil if keywords.blank?

        "<keywords>#{keywords}</keywords>"
      end

      def factors_section
        grouped_factors = group_factors_by_competency
        return nil if grouped_factors.blank?

        competencies_content = grouped_factors.map do |competency, factor_scorings|
          build_competency_with_indicators(competency, factor_scorings)
        end.join("\n")

        <<~COMPETENCIES.strip
          <competencies>
          #{competencies_content}
          </competencies>
        COMPETENCIES
      end

      def group_factors_by_competency
        factors_scorings = question.factors_scorings.
                           includes(factor: :parent_factors).
                           order(:id)

        grouped = {}

        factors_scorings.each do |fs|
          indicator = fs.factor

          parent_competency = indicator.parent_factors.first

          if parent_competency
            grouped[parent_competency] ||= []
            grouped[parent_competency] << fs
          else
            # Indicators without parent competency
            grouped[nil] ||= []
            grouped[nil] << fs
          end
        end

        grouped
      end

      def build_competency_with_indicators(competency, factor_scorings)
        indicators_content = factor_scorings.map { |fs| build_indicator(fs) }.join("\n")
        if competency
          <<~COMPETENCY.strip
            <competency>
              <name>#{competency.name}</name>
              <description>#{competency.description}</description>
              <indicators>
              #{indicators_content}
              </indicators>
            </competency>
          COMPETENCY
        else
          <<~COMPETENCY.strip
            <competency>
              <indicators>
              #{indicators_content}
              </indicators>
            </competency>
          COMPETENCY
        end
      end

      def build_indicator(factor_scoring)
        factor = factor_scoring.factor

        <<~INDICATOR.strip.squeeze("\n")
          <indicator id="#{factor.id}">
            <name>#{factor.name}</name>
            <description>#{factor.description}</description>
            #{what_to_look_for(factor_scoring)}
            #{score_definitions_for(factor_scoring)}
          </indicator>
        INDICATOR
      end

      def what_to_look_for(factor_scoring)
        what_to_look_for = factor_scoring.ai_scoring_config&.dig('what_to_look_for')
        return nil if what_to_look_for.blank?

        "<what_to_look_for>#{what_to_look_for}</what_to_look_for>"
      end

      def score_definitions_for(factor_scoring)
        levels = factor_scoring.ai_scoring_config&.dig('score_definitions')
        return nil if levels.blank?

        formatted_levels = levels.
                           sort_by { |level| level['score'].to_i }.
                           map { |level| "  <level score=\"#{level['score']}\">#{level['definition']}</level>" }.
                           join("\n")

        <<~LEVELS.strip
          <score_definitions>
          #{formatted_levels}
          </score_definitions>
        LEVELS
      end

      def candidate_response_section
        content = response_content
        return nil if content.blank?

        <<~RESPONSE.strip
          <candidate_response>
            #{content.strip}
          </candidate_response>
        RESPONSE
      end

      def response_content
        case question.type
          when 'TextEntry'
            text_response_content
          when 'AudioResponse', 'VideoResponse'
            media_response_content
        end
      end

      def text_response_content
        answer = users_result.answers[question.id.to_s]
        return nil if answer&.dig('answers').blank?

        answer['answers'].filter_map { |a| a['value'] || a['text'] }.join(', ').presence
      end

      def media_response_content
        active_response = users_result.active_media_response(question)
        return nil if active_response.blank?

        active_response.transcription&.text
      end
    end
  end
end
