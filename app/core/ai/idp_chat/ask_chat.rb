# frozen_string_literal: true

module AI::IdpChat
  class AskChat < AsyncResponseRequest::AsyncRequestHandler
    MOCKED_MESSAGES = [
      'What motivates you to achieve your goals?',
      'How do you handle stressful situations?',
      'Describe a time you overcame a significant challenge.',
      'What are your strengths and weaknesses?',
      'How do you prioritize your tasks?',
      'What does success mean to you?',
      'How do you stay focused on long-term objectives?',
      'Can you describe your ideal work environment?',
      'How do you approach problem-solving?',
      'What role does feedback play in your personal growth?'
    ].freeze

    def call
      # call AI::IDPAssistantService.chat

      delay 2

      async_response.response_data = if context[:message] == 'document'
                                       { role: 'assistant',
                                         content: { message: 'Please upload document', component: 'RequestDocument' } }
                                     elsif context[:message] == 'summary'
                                       { role: 'assistant',
                                         content: { message: 'Please upload document', component: 'Summary' } }
                                     else
                                       { role: 'assistant', content: MOCKED_MESSAGES.sample }
                                     end

      broadcast(:ok, async_response)
    end

    private

    def async_response
      @async_response ||= AsyncResponseRequest::AsyncResponse.new(
        async_request_uuid: context['async_request_uuid'],
        processing_status: :completed
      )
    end
  end
end
