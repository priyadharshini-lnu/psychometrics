# frozen_string_literal: true

module IdpTemplates
  class UpdateReflectionQuestions < BaseCommand
    attr_accessor :idp_template, :reflection_questions_params

    def initialize(idp_template, reflection_questions_params)
      @idp_template = idp_template
      @reflection_questions_params = reflection_questions_params
    end

    def call
      IdpTemplate.transaction do
        ids = reflection_questions_params.map { |reflection_question| reflection_question[:id] }

        idp_template.idp_template_reflection_questions.where.not(reflection_question_id: ids).destroy_all
        reflection_questions_params.each do |rq|
          itrq = idp_template.idp_template_reflection_questions.find_or_create_by!(reflection_question_id: rq[:id])
          itrq.update(mandatory: rq[:mandatory], min_words: rq[:min_words], max_words: rq[:max_words])
        end
        broadcast :ok
      end
    end
  end
end
