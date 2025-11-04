# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Lti::CreateIdToken do
  let(:project) { create(:project) }
  let(:user) { create(:user) }
  let(:user_assessment) { create(:user_assessment) }
  let(:target_link_uri) { 'https://example.com/launch' }
  let(:nonce) { 'test-nonce' }
  let(:deployment_id) { 'test-deployment' }
  let(:private_key) { OpenSSL::PKey::RSA.new(2048) }

  let!(:yoodli_user_assessment) { create(:yoodli_user_assessment, user_assessment: user_assessment) }

  before do
    allow(ENV).to receive(:fetch).and_call_original
    allow(ENV).to receive(:fetch).with('LTI_PRIVATE_KEY', '').and_return(private_key.to_pem)
    allow(Settings).to receive_message_chain(:secrets, :encrypted_key).and_return('test-encryption-key')
    allow_any_instance_of(UserAssessment).to receive(:publish_assessment_assigned_webhook)
  end

  describe '#call' do
    subject do
      described_class.new(
        client_id: 'test-client-id',
        redirect_uri: 'https://example.com/redirect',
        login_hint: user_assessment.encoded_id,
        lti_message_hint: 'test-message-hint',
        nonce: nonce,
        integration: create(:integration, name: :yoodli)
      )
    end

    context 'with valid parameters' do
      it 'broadcasts ok event with ID token' do
        expect { subject.call }.to broadcast(:ok, kind_of(String))
      end

      it 'creates a valid JWT with correct structure' do
        expect { subject.call }.to broadcast(:ok, kind_of(String))

        # Extract the ID token from the broadcast
        id_token = nil
        allow(subject).to receive(:broadcast) do |event, token|
          id_token = token if event == :ok
        end
        subject.call

        # Decode JWT without verification for testing
        decoded_token = JWT.decode(id_token, nil, false).first

        # Test standard JWT claims
        expect(decoded_token['iss']).to be_present
        expect(decoded_token['aud']).to eq('test-client-id')
        expect(decoded_token['sub']).to eq(user_assessment.encoded_id)
        expect(decoded_token['nonce']).to eq(nonce)
        expect(decoded_token['iat']).to be_a(Integer)
        expect(decoded_token['exp']).to be_a(Integer)
        expect(decoded_token['exp']).to be > decoded_token['iat']

        # Test LTI 1.3 specific claims
        expect(decoded_token['https://purl.imsglobal.org/spec/lti/claim/message_type']).to eq('LtiResourceLinkRequest')
        expect(decoded_token['https://purl.imsglobal.org/spec/lti/claim/version']).to eq('1.3.0')

        # Test roles claim
        roles = decoded_token['https://purl.imsglobal.org/spec/lti/claim/roles']
        expect(roles).to include('http://purl.imsglobal.org/vocab/lis/v2/membership#Learner')
        expect(roles).to include('http://purl.imsglobal.org/vocab/lis/v2/institution/person#Student')

        # Test resource link claim
        resource_link = decoded_token['https://purl.imsglobal.org/spec/lti/claim/resource_link']
        expect(resource_link).to have_key('id')
        expect(resource_link).to have_key('title')

        # Test context claim
        context_claim = decoded_token['https://purl.imsglobal.org/spec/lti/claim/context']
        expect(context_claim).to have_key('id')
        expect(context_claim).to have_key('type')

        # Test tool platform claim
        tool_platform = decoded_token['https://purl.imsglobal.org/spec/lti/claim/tool_platform']
        expect(tool_platform).to have_key('name')
        expect(tool_platform).to have_key('guid')

        # Test deployment ID
        expect(decoded_token['https://purl.imsglobal.org/spec/lti/claim/deployment_id']).to be_present

        # Test target link URI
        expect(decoded_token['https://purl.imsglobal.org/spec/lti/claim/target_link_uri']).to eq('https://example.com/redirect')

        # Test user information
        expect(decoded_token['name']).to be_present
        expect(decoded_token['given_name']).to be_present
        expect(decoded_token['family_name']).to be_present
        expect(decoded_token['email']).to be_present

        # Test locale
        expect(decoded_token['locale']).to be_present

        # Test launch presentation
        launch_presentation = decoded_token['https://purl.imsglobal.org/spec/lti/claim/launch_presentation']
        expect(launch_presentation).to have_key('document_target')
        expect(launch_presentation).to have_key('height')
        expect(launch_presentation).to have_key('width')
        expect(launch_presentation).to have_key('return_url')

        # Test custom claims
        expect(decoded_token['https://purl.imsglobal.org/spec/lti/claim/custom']).to be_present
      end

      it 'includes LTI Advantage Services endpoint claim' do
        id_token = nil
        allow(subject).to receive(:broadcast) do |event, token|
          id_token = token if event == :ok
        end
        subject.call

        decoded_token = JWT.decode(id_token, nil, false).first

        # Test AGS endpoint claim
        ags_endpoint = decoded_token['https://purl.imsglobal.org/spec/lti-ags/claim/endpoint']
        expect(ags_endpoint).to have_key('scope')
        expect(ags_endpoint).to have_key('lineitem')

        # Test AGS scopes
        scopes = ags_endpoint['scope']
        expect(scopes).to include('https://purl.imsglobal.org/spec/lti-ags/scope/lineitem')
        expect(scopes).to include('https://purl.imsglobal.org/spec/lti-ags/scope/result.readonly')
        expect(scopes).to include('https://purl.imsglobal.org/spec/lti-ags/scope/score')
      end

      it 'updates the LTI provider user assessment with email' do
        expect { subject.call }.to change { yoodli_user_assessment.reload.email }.from(nil).to(kind_of(String))
      end
    end

    context 'with invalid login_hint (no user assessment found)' do
      subject do
        described_class.new(
          client_id: 'test-client-id',
          redirect_uri: 'https://example.com/redirect',
          login_hint: 'invalid_encoded_id', # This will cause UserAssessment lookup to fail
          lti_message_hint: 'test-message-hint',
          nonce: nonce,
          integration: create(:integration, name: :yoodli)
        )
      end

      it 'broadcasts error event' do
        expect { subject.call }.to broadcast(:error, kind_of(String))
      end
    end

    context 'with non-yoodli integration' do
      subject do
        described_class.new(
          client_id: 'test-client-id',
          redirect_uri: 'https://example.com/redirect',
          login_hint: user_assessment.encoded_id,
          lti_message_hint: 'test-message-hint',
          nonce: nonce,
          integration: create(:integration, name: :hogan)
        )
      end

      it 'does not update LTI provider user assessment' do
        expect { subject.call }.not_to(change { yoodli_user_assessment.reload.email })
      end
    end
  end
end
