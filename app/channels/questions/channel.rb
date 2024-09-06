# frozen_string_literal: true

module Questions
  class Channel < ApplicationCable::Channel
    include Questions::Actions::Question
    include Pundit
    include Administration::Policies

    def subscribed
      question = Question.find(params['question_id'])
      if Administration::QuestionPolicy.new(current_user, question).edit?
        transmit(
          {
            action: 'question_data',
            data: QuestionSerializer.new(
              context: {
                include: '**'
              }
            ).serialize(question)
          }
        )
      else
        reject
      end
    end

    def pundit_user
      current_user
    end
  end
end
