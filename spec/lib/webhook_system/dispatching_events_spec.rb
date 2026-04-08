# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'dispatching events', aggregate_failures: true do
  let(:hook_url) { 'http://lvh.me/hook1' }
  describe 'dispatching' do
    let!(:subscription1) do
      create(:webhook_subscription, :active, :encrypted, :with_topics, url: hook_url, topics: ['other_event'])
    end

    let!(:subscription2) do
      create(:webhook_subscription, :active, :encrypted, :with_topics, url: 'http://lvh.me/hook2',
topics: ['some_event'])
    end

    let(:event_class) do
      Class.new(WebhookSystem::BaseEvent) do
        def event_name
          'other_event'
        end

        def payload_attributes
          %i[
            name
            age
          ]
        end

        attribute :name, type: String
        attribute :age, type: Integer
        validates :name, presence: true
        validates :age, presence: true
      end
    end

    let(:event) { event_class.build(name: 'John', age: 21) }
    let(:subscription1_hook_stub) do
      headers = { 'Content-Type' => 'application/json; base64+aes256' }
      stub_request(:post, hook_url).with(body: /.*/, headers: headers)
    end

    describe 'successful delivery' do
      it 'fires the jobs' do
        stub = subscription1_hook_stub.to_return(status: [200, 'OK'],
                                                 body: 'Success',
                                                 headers: { 'Hello' => 'World' })

        expect do
          perform_enqueued_jobs do
            Webhook.dispatch event
          end
        end.to change { subscription1.event_logs.count }.by(1)

        expect(stub).to have_been_requested.once

        log = subscription1.event_logs.last

        expect(log.status).to eq(200)
        expect(log.response['body']).to eq('Success')
        expect(log.response['headers']).to eq('hello' => 'World')
      end
    end
  end
end
