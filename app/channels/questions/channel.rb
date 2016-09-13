module Questions
  class Channel < ApplicationCable::Channel
    include Questions::Actions::Question
    include Questions::Actions::Comment
    include Pundit
    include Administration::Policies

    def subscribed
      question = Question.find(params['question_id'])
      transmit({
                   action: 'question_data',
                   data:   QuestionSerializer.new(question).to_hash(include: '**')
               })
    end

    def pundit_user
      current_administrator
    end
  end
end
