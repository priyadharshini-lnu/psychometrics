# frozen_string_literal: true

module EndUser
  class ReflectionQuestionSerializer < Panko::Serializer
    attributes :id, :question, :mandatory, :min_words, :max_words, :answer

    delegate :reflection_question, to: :object
    delegate :id, :question, to: :reflection_question

    def answer
      answers[object.reflection_question_id]
    end

    private

    def answers
      context[:reflection_answers]
    end
  end
end
