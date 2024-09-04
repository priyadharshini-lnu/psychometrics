# frozen_string_literal: true

require 'rails_helper'

RSpec.describe AsyncResponseRequest::SetAsyncResponse do
  let(:async_request_uuid) { '123' }
  let(:async_response) do
    AsyncResponseRequest::AsyncResponse.new(processing_status: 'in_progress', async_request_uuid: async_request_uuid,
                                            response_data: {}, response_type: 'json')
  end
  let(:command) { described_class.new(async_response: async_response) }

  before do
    allow($redis).to receive(:setex) # rubocop:disable Style/GlobalVars
  end

  describe '#call' do
    it 'sets the async response in Redis with a TTL' do
      command.call

      expect($redis).to have_received(:setex). # rubocop:disable Style/GlobalVars
        with(async_response.async_request_uuid, described_class::TTL, async_response.to_json)
    end
  end
end
