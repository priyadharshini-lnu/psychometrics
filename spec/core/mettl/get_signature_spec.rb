# frozen_string_literal: true

require 'rails_helper'

describe Mettl::GetSignature do
  let(:config) { { 'public_key' => 'public_key_value', 'private_key' => 'private_key_value' } }
  let(:api_endpoint) { '/api/endpoint' }
  let(:http_method) { 'GET' }
  let(:timestamp) { 1_614_000_000 }
  let(:string_to_sign) { "#{http_method}#{api_endpoint}\n#{config['public_key']}\n#{timestamp}" }
  let(:expected_signature) { 'VVZuCZlk41R3lAqImQ4J5LE8JZTug9DUJkXxvqPwd5k%3D' }
  let(:subject) { described_class.new(config, string_to_sign) }

  describe '#call' do
    context 'when successful' do
      it 'broadcasts :ok with the exact signature' do
        expect(subject).to receive(:broadcast).with(:ok, expected_signature)
        subject.call
      end
    end

    context 'when an error occurs' do
      before do
        allow(subject).to receive(:generate_signature).and_raise(StandardError, 'error message')
      end

      it 'broadcasts :error with the error message' do
        expect(subject).to receive(:broadcast).with(:error, 'error message')
        subject.call
      end
    end
  end
end
