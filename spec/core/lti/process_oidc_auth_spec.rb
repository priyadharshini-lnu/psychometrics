# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Lti::ProcessOidcAuth do
  let(:project) { create(:project) }
  let(:integration) { create(:integration, :yoodli, project: project) }
  let(:form) do
    double('form',
           valid?: true,
           iss: 'test-issuer',
           login_hint: 'test-hint',
           target_link_uri: 'https://example.com/launch',
           client_id: 'test-client',
           lti_deployment_id: integration.id,
           redirect_uri: 'https://example.com/redirect',
           lti_message_hint: 'test-message-hint',
           nonce: 'test-nonce',
           state: 'test-state')
  end

  describe '#call' do
    subject { described_class.new(form) }

    context 'with valid form' do
      before do
        allow(Lti::CreateIdToken).to receive(:call).and_return({ id_token: 'test-jwt-token' })
      end

      it 'broadcasts ok event' do
        expect { subject.call }.to broadcast(:ok, kind_of(Hash))
      end
    end

    context 'with invalid form' do
      let(:invalid_form) { double('form', valid?: false, lti_deployment_id: 123) }
      let(:subject) { described_class.new(invalid_form) }

      it 'broadcasts error event' do
        expect { subject.call }.to broadcast(:error, kind_of(String))
      end
    end

    context 'when integration is not found' do
      let(:no_integration_form) { double('form', valid?: true, lti_deployment_id: 999) }
      let(:subject) { described_class.new(no_integration_form) }

      before do
        allow(Integration).to receive_message_chain(:active, :find_by).and_return(nil)
      end

      it 'broadcasts error event' do
        expect { subject.call }.to broadcast(:error, kind_of(String))
      end
    end
  end
end
