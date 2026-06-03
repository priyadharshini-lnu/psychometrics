# frozen_string_literal: true

require 'rails_helper'

RSpec.describe OciSpeech::Realtime::Token, type: :command do
  let(:token_value) { 'sample_token' }
  let(:compartment_id) { 'ocid1.compartment.oc1..samplecompartment' }
  let(:session_id) { 'ocid1.aispeechrealtimesession.oc1..samplesession' }
  let(:region) { 'us-ashburn-1' }

  let(:token_data) do
    double('TokenData',
           token: token_value,
           compartment_id: compartment_id,
           session_id: session_id)
  end

  let(:oci_response) { double('OciResponse', data: token_data) }
  let(:speech_client) { instance_double(OCI::AiSpeech::AIServiceSpeechClient) }
  let(:oci_config) { double('OCI::Config') }

  before do
    allow(Psy::Oci).to receive(:config).and_return(oci_config)
    allow(OCI::AiSpeech::AIServiceSpeechClient).to receive(:new).with(config: oci_config).and_return(speech_client)
    allow(speech_client).to receive(:create_realtime_session_token).and_return(oci_response)
    allow(Settings).to receive_message_chain(:secrets, :oci, :compartment_id).and_return(compartment_id)
    allow(Settings).to receive_message_chain(:secrets, :oci, :default_region).and_return(region)
  end

  describe '#call' do
    context 'when the OCI API returns a token successfully' do
      it 'broadcasts :ok with the token details' do
        result = described_class.call

        expect(result[:ok]).to eq({
          token: token_value,
          compartment_id: compartment_id,
          session_id: session_id,
          region: region
        })
      end

      it 'does not broadcast :error' do
        result = described_class.call

        expect(result[:error]).to be_nil
      end
    end

    context 'when the OCI API raises a StandardError' do
      before do
        allow(speech_client).to receive(:create_realtime_session_token).and_raise(StandardError, 'OCI unavailable')
      end

      it 'broadcasts :error with the error message' do
        result = described_class.call

        expect(result[:error]).to eq('OCI unavailable')
      end

      it 'does not broadcast :ok' do
        result = described_class.call

        expect(result[:ok]).to be_nil
      end
    end
  end
end
