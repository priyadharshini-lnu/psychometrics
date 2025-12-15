# frozen_string_literal: true

require 'rails_helper'

RSpec.describe SamlIdp::DeterminePrincipal do
  subject { described_class.new(service_provider: service_provider, current_user: current_user, request: request) }

  let(:project) { create(:project) }
  let(:current_user) { create(:user, project: project) }
  let(:request) { double('Request', cookies: cookies) }
  let(:cookies) { {} }

  describe '#call' do
    context 'with invalid parameters' do
      context 'when service_provider is nil' do
        let(:service_provider) { nil }

        it 'returns error' do
          subject.call do
            on(:error) do |error_message|
              expect(error_message).to eq('Invalid parameters')
            end
          end
        end
      end

      context 'when current_user is nil' do
        let(:service_provider) { create(:saml_service_provider, project: project) }
        let(:current_user) { nil }

        it 'returns error' do
          subject.call do
            on(:error) do |error_message|
              expect(error_message).to eq('Invalid parameters')
            end
          end
        end
      end

      context 'when request is nil' do
        let(:service_provider) { create(:saml_service_provider, project: project) }
        let(:request) { nil }

        it 'returns error' do
          subject.call do
            on(:error) do |error_message|
              expect(error_message).to eq('Invalid parameters')
            end
          end
        end
      end
    end

    context 'with valid parameters' do
      context 'when service provider is Yoodli integration' do
        let(:service_provider) do
          create(:saml_service_provider, project: project).tap do |sp|
            sp.update!(integration_type: :yoodli)
          end
        end
        let(:assessment) { create(:assessment, :yoodli, project: project) }
        let(:user_assessment) do
          create(:user_assessment, subject: current_user, evaluator: current_user, assessment: assessment)
        end
        let(:cookies) { { 'saml_user_assessment_id' => user_assessment.id.to_s } }

        context 'when Yoodli assessment exists with email' do
          let!(:yoodli_user_assessment) do
            create(:yoodli_user_assessment,
                   user_assessment: user_assessment,
                   email: 'user@yoodli.com',
                   active: true)
          end

          it 'returns Yoodli principal' do
            subject.call do
              on(:ok) do |principal|
                expect(principal.email).to eq('user@yoodli.com')
                expect(principal.name).to eq(current_user.name)
                expect(principal.id).to eq(current_user.id)
              end
            end
          end
        end

        context 'when no user assessment cookie exists' do
          let(:cookies) { {} }

          it 'returns error' do
            subject.call do
              on(:error) do |error_message|
                expect(error_message).to eq('Unable to determine user principal for SAML authentication')
              end
            end
          end
        end

        context 'when user assessment not found' do
          let(:cookies) { { 'saml_user_assessment_id' => '99999' } }

          it 'returns error' do
            subject.call do
              on(:error) do |error_message|
                expect(error_message).to eq('Unable to determine user principal for SAML authentication')
              end
            end
          end
        end
      end

      context 'when service provider is generic integration' do
        let(:service_provider) { create(:saml_service_provider, project: project) }

        context 'when masking is disabled' do
          before do
            allow(service_provider).to receive(:mask_identity?).and_return(false)
          end

          it 'returns current user as principal' do
            subject.call do
              on(:ok) do |principal|
                expect(principal).to eq(current_user)
              end
            end
          end
        end

        context 'when masking is enabled' do
          let(:masked_identity) { double('MaskedIdentity', name: 'Anonymous') }

          before do
            allow(service_provider).to receive(:mask_identity?).and_return(true)
            allow(service_provider).to receive(:mask_identity).and_return(true)
            allow(current_user).to receive(:maskable_identity).with(mask: true).and_return(masked_identity)
          end

          it 'returns masked identity as principal' do
            subject.call do
              on(:ok) do |principal|
                expect(principal).to eq(masked_identity)
              end
            end
          end
        end
      end
    end
  end
end
