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
      expect(Saville::StartAssessment).to receive(:call!).
        with(context).and_return(saville_assessment_order_response)

      in_progress_async_response = AsyncResponseRequest::AsyncResponse.new(
        async_request_uuid: async_request_uuid, processing_status: :in_progress
      )
      expect(AsyncResponseRequest::SetAsyncResponse).to receive(:call!).
        with(async_response: in_progress_async_response)

      completed_async_response = AsyncResponseRequest::AsyncResponse.new(
        async_request_uuid: async_request_uuid,
        processing_status: :completed,
        response_type: :redirect,
        response_data: 'https://saville.cc.com/assessment_id'
      )
      expect(AsyncResponseRequest::SetAsyncResponse).to receive(:call!).with(async_response: completed_async_response)

      described_class.new.perform(context: context, handler: ::Saville::StartAssessment)
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
            handler: ::Saville::StartAssessment,
            params: context
          }
        )

        described_class.new.perform(context: context, handler: ::Saville::StartAssessment)
      end
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
