# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Lti::StartLaunch do
  let(:project) { create(:project) }
  let(:user) { create(:user) }
  let(:user_assessment) { create(:user_assessment) }
  let!(:integration_record) do
    create(:integration, name: :yoodli, project: project, active: true, config: {
      'launch_url' => 'https://yoodli.example.com/lti/launch',
      'login_url' => 'https://yoodli.example.com/lti/login',
      'keyset_url' => 'https://yoodli.example.com/.well-known/jwks',
      'domain' => 'yoodli.example.com'
    })
  end
  let(:integration) { 'yoodli' }
  let(:context) do
    {
      project: project,
      current_user: user,
      integration: integration,
      params: { id: '123' },
      meta: { user_assessment_id: user_assessment.id }
    }
  end

  describe '#call' do
    subject { described_class.new(context) }

    context 'with valid context' do
      it 'returns hash with login_url and params' do
        result = nil
        subject.on(:ok) { |data| result = data }
        subject.call

        expect(result).to be_a(Hash)
        expect(result).to have_key(:login_url)
        expect(result).to have_key(:params)
        expect(result[:login_url]).to eq('https://yoodli.example.com/lti/login')
        expect(result[:params]).to include(
          iss: kind_of(String),
          client_id: project.id.to_s,
          login_hint: UserAssessment.encode_id(user_assessment.id),
          lti_deployment_id: integration_record.id.to_s,
          target_link_uri: 'https://yoodli.example.com/lti/launch'
        )
      end

      context 'when user assessment has not been started' do
        before do
          user_assessment.update!(started_at: nil, status: 'not_started')
        end

        it 'sets started_at timestamp when nil' do
          expect { subject.call }.to change { user_assessment.reload.started_at }.from(nil)
          expect(user_assessment.reload.started_at).to be_within(5.seconds).of(Time.zone.now)
        end

        it 'changes status to in_progress' do
          expect { subject.call }.to change { user_assessment.reload.status }.
            from('not_started').to('in_progress')
        end
      end

      context 'when user assessment already has started_at' do
        let(:original_started_at) { 2.hours.ago }

        before do
          user_assessment.update!(started_at: original_started_at, status: 'not_started')
        end

        it 'does not update started_at timestamp' do
          expect { subject.call }.not_to(change { user_assessment.reload.started_at })
          expect(user_assessment.reload.started_at).to eq(original_started_at)
        end

        it 'still changes status to in_progress' do
          expect { subject.call }.to change { user_assessment.reload.status }.
            from('not_started').to('in_progress')
        end
      end

      context 'when user assessment is already in progress' do
        before do
          user_assessment.update!(started_at: 1.hour.ago, status: 'in_progress')
        end

        it 'does not change started_at or status' do
          expect { subject.call }.not_to(change { user_assessment.reload.started_at })
          expect { subject.call }.not_to(change { user_assessment.reload.status })
        end
      end
    end

    context 'when user assessment is completed' do
      let(:campaign) { create(:campaign) }
      let(:completed_user_assessment) { create(:user_assessment, :completed, campaign: campaign) }
      let(:context) do
        {
          project: project,
          current_user: user,
          integration: integration,
          params: { id: '123' },
          meta: { user_assessment_id: completed_user_assessment.id }
        }
      end

      it 'returns hash with redirect_url for completed assessment' do
        result = nil
        subject.on(:ok) { |data| result = data }
        subject.call

        expect(result).to be_a(Hash)
        expect(result).to have_key(:redirect_url)
        expect(result[:redirect_url]).to include("/assessment_completed/#{campaign.id}")
        expect(result[:redirect_url]).to include("user_assessment_id=#{completed_user_assessment.id}")
      end
    end

    context 'with missing required parameters' do
      let(:context) { {} }

      it 'broadcasts error event' do
        expect { subject.call }.to broadcast(:error, kind_of(String))
      end
    end

    context 'with nil project' do
      let(:context) do
        {
          project: nil,
          current_user: user,
          integration: integration,
          meta: { user_assessment_id: user_assessment.id }
        }
      end

      it 'broadcasts error event' do
        expect { subject.call }.to broadcast(:error, 'No active LTI integration found')
      end
    end
  end
end
