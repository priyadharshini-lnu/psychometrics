# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Lti::Ags::ProcessScoreSubmission do
  let(:project) { create(:project) }
  let(:user_assessment) { create(:user_assessment) }
  let(:valid_token) { 'valid_token_123' }
  let(:token_hash) { Digest::SHA256.hexdigest(valid_token) }
  let!(:oauth2_token) do
    create(:lti_oauth2_access_token,
           token_hash: token_hash,
           project: project,
           scope: 'https://purl.imsglobal.org/spec/lti-ags/scope/score',
           expires_at: 1.hour.from_now,
           revoked: false)
  end
  let(:score_data) do
    {
      'userId' => user_assessment.encoded_id,
      'scoreGiven' => 85,
      'scoreMaximum' => 100,
      'line_item_id' => 'test_line_item',
      'comment' => 'Great work!',
      'activityProgress' => 'Completed',
      'gradingProgress' => 'FullyGraded'
    }
  end
  let(:request) do
    double('request', headers: { 'Authorization' => "Bearer #{valid_token}" })
  end

  describe '#call' do
    subject { described_class.new(score_data, request) }

    context 'with valid authentication and score data' do
      it 'returns success result' do
        result = subject.call
        expect(result[:success]).to be_truthy
        expect(result[:project_id]).to eq(project.id)
      end

      it 'updates user assessment external results' do
        expect { subject.call }.to change {
          user_assessment.users_result.reload.external_results
        }.from({}).to(score_data)
      end

      it 'completes the user assessment' do
        subject.call
        expect(user_assessment.reload).to be_completed
      end
    end

    context 'with missing authorization header' do
      let(:request) { double('request', headers: {}) }

      it 'returns unauthorized error' do
        result = subject.call
        expect(result[:error]).to eq('Unauthorized')
      end
    end

    context 'with invalid token' do
      let(:request) do
        double('request', headers: { 'Authorization' => 'Bearer invalid_token' })
      end

      it 'returns unauthorized error' do
        result = subject.call
        expect(result[:error]).to eq('Unauthorized')
      end
    end

    context 'with missing required score data' do
      let(:score_data) { { 'line_item_id' => 'test' } }

      it 'returns user assessment not found error' do
        result = subject.call
        expect(result[:error]).to eq('User assessment not found')
      end
    end

    context 'with invalid score format' do
      let(:score_data) do
        {
          'userId' => user_assessment.encoded_id,
          'scoreGiven' => 'invalid_score',
          'line_item_id' => 'test',
          'activityProgress' => 'Completed'
        }
      end

      it 'processes score data regardless of format' do
        result = subject.call
        expect(result[:success]).to be_truthy
        expect(result[:project_id]).to eq(project.id)
      end
    end

    context 'when user assessment is not found' do
      let(:score_data) do
        {
          'userId' => 'nonexistent',
          'scoreGiven' => 85,
          'scoreMaximum' => 100,
          'line_item_id' => 'test'
        }
      end

      it 'returns user assessment not found error' do
        result = subject.call
        expect(result[:error]).to eq('User assessment not found')
      end
    end
  end
end
