# frozen_string_literal: true

require 'rails_helper'

describe AsyncRequestHandlerJob, type: :job do
  let(:user_assessment) { create(:user_assessment) }
  let(:saville_user_assessment) { create(:saville_user_assessment, user_assessment: user_assessment) }
  let(:async_request_uuid) { 'dsdasdsds' }
  let(:saville_assessment_order_response) { saville_assessment_order_response_data }
  let(:saville_assessment_url) { 'https://saville.cc.com/assessment_id' }
  let(:saville_receipt_id) { 'receipt_id' }
  let(:current_user) { create(:user) }

  let(:context) do
    { async_request_uuid: async_request_uuid, current_user: current_user }
  end

  describe '#perform' do
    it 'calls the appropriate request handler and stores the response' do
      allow(Saville::StartAssessment).to receive(:call!) do |_, &block|
        block.call(:ok, saville_assessment_order_response)
      end

      in_progress_async_response = AsyncResponseRequest::AsyncResponse.new(
        async_request_uuid: async_request_uuid, processing_status: :in_progress
      )
      expect(AsyncResponseRequest::SetAsyncResponse).to receive(:call!).
        with(async_response: in_progress_async_response)

      described_class.new.perform(context: context, handler: Saville::StartAssessment)
    end

    context 'when an error occurs' do
      before do
        allow(Saville::StartAssessment).to receive(:call!).and_raise(StandardError.new('Test error'))
      end

      it 'sends an error to Sentry when an exception occurs' do
        expect(Sentry).to receive(:capture_exception).with(
          instance_of(StandardError),
          extra: {
            async_request_uuid: async_request_uuid,
            handler: Saville::StartAssessment,
            params: context
          }
        )

        described_class.new.perform(context: context, handler: Saville::StartAssessment)
      end
    end
  end

  describe 'retry behavior with AsyncRequestError' do
    let(:error_message) { 'Rate limit exceeded' }
    let(:async_response) do
      AsyncResponseRequest::AsyncResponse.new(
        async_request_uuid: async_request_uuid,
        processing_status: :failed,
        response_data: { content: { message: error_message, component: 'Error' } }
      )
    end
    let(:async_request_error) do
      AsyncResponseRequest::AsyncRequestError.new(
        error_message,
        async_response: async_response,
        error: RubyLLM::RateLimitError.new(nil, error_message)
      )
    end

    before do
      allow(AI::IdpChat::AskChat).to receive(:call!).and_raise(async_request_error)
    end

    context 'when retries are exhausted' do
      it 'sends exception to Sentry with retry context' do
        expect(Sentry).to receive(:capture_exception).with(
          async_request_error,
          extra: hash_including(
            error: async_request_error.error,
            async_request_uuid: async_request_uuid,
            handler: AI::IdpChat::AskChat,
            params: context,
            retries_exhausted: true
          )
        )

        perform_enqueued_jobs do
          described_class.perform_later(context: context, handler: AI::IdpChat::AskChat)
        end
      end

      it 'stores the failure response from exception' do
        # Allow the in_progress response to be stored
        allow(AsyncResponseRequest::SetAsyncResponse).to receive(:call!)

        # Expect the failure response to be stored after retries exhausted
        expect(AsyncResponseRequest::SetAsyncResponse).to receive(:call!).
          with(async_response: async_response).at_least(:once)

        perform_enqueued_jobs do
          described_class.perform_later(context: context, handler: AI::IdpChat::AskChat)
        end
      end
    end

    it 'passes increasing execution count to handler on retries' do
      execution_counts = []
      allow(AI::IdpChat::AskChat).to receive(:call!) do |context_arg|
        execution_counts << context_arg[:executions]
        raise async_request_error
      end

      perform_enqueued_jobs do
        described_class.perform_later(context: context, handler: AI::IdpChat::AskChat)
      end

      expect(execution_counts).to eq([1, 2, 3])
    end
  end

  describe 'queue' do
    it 'queues the job in the correct queue' do
      expect { described_class.perform_later }.
        to have_enqueued_job.on_queue('async_request_handler')
    end
  end

  private

  def saville_assessment_order_response_data
    AsyncResponseRequest::AsyncResponse.new(
      processing_status: :completed,
      response_type: :redirect,
      response_data: 'https://saville.cc.com/assessment_id'
    )
  end
end
