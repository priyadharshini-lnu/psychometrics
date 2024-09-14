# frozen_string_literal: true

require 'rails_helper'

describe AsyncResponseRequest::GetAsyncResponse do
  let!(:async_request_uuid) { 'some uuid' }

  context 'when the requested data is not found in Redis' do
    it 'broadcasts :ok with :request_not_found status and nil response' do
      expect { described_class.new('new_uuid').call }.to broadcast(:ok, [:request_not_found, nil])
    end
  end
  context 'when the requested data is in progress' do
    let(:async_response) do
      AsyncResponseRequest::AsyncResponse.new(processing_status: 'in_progress', async_request_uuid: async_request_uuid,
                                              response_data: {}, response_type: 'json')
    end

    before do
      AsyncResponseRequest::SetAsyncResponse.call!(async_response: async_response)
    end

    it 'broadcasts :ok with :in_progress status and async_response' do
      expect { described_class.new(async_request_uuid).call }.to broadcast(:ok, ['in_progress', async_response])
    end
  end

  context 'when the requested data is complete' do
    let(:async_response) do
      AsyncResponseRequest::AsyncResponse.new(processing_status: 'complete', async_request_uuid: async_request_uuid,
                                              response_data: { 'some' => 'data' }, response_type: 'json')
    end

    before do
      AsyncResponseRequest::SetAsyncResponse.call!(async_response: async_response)
    end

    it 'broadcasts :ok with :complete status and async_response' do
      expect { described_class.new(async_request_uuid).call }.to broadcast(:ok, ['complete', async_response])
    end
  end
end
