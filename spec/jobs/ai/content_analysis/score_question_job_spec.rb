# frozen_string_literal: true

require 'rails_helper'

RSpec.describe AI::ContentAnalysis::ScoreQuestionJob, type: :job do
  include ActiveJob::TestHelper

  let(:users_result) { create(:users_result) }
  let(:question) { create(:question) }

  before do
    clear_enqueued_jobs
    clear_performed_jobs
  end

  describe '#perform' do
    before do
      allow(AI::ContentAnalysis::ScoreQuestion).to receive(:call!)
      allow(AI::ContentAnalysis::SyncScoringStatus).to receive(:call!)
    end

    it 'calls ScoreQuestion with correct parameters' do
      described_class.perform_now(users_result.id, question.id)

      expect(AI::ContentAnalysis::ScoreQuestion).to have_received(:call!).with(
        question,
        users_result,
        rescore: false
      )
    end

    it 'calls SyncScoringStatus after scoring' do
      described_class.perform_now(users_result.id, question.id)

      expect(AI::ContentAnalysis::SyncScoringStatus).to have_received(:call!).with(
        users_result,
        rescore: false,
        admin_job_record_id: nil
      )
    end

    context 'with rescore option' do
      it 'passes rescore flag to ScoreQuestion' do
        described_class.perform_now(users_result.id, question.id, rescore: true)

        expect(AI::ContentAnalysis::ScoreQuestion).to have_received(:call!).with(
          question,
          users_result,
          rescore: true
        )
      end
    end
  end

  describe 'retry behavior for RateLimitError' do
    let(:rate_limit_error) { RubyLLM::RateLimitError.new(nil, response: { error: { message: 'Rate limit exceeded' } }) }

    before do
      allow(AI::ContentAnalysis::ScoreQuestion).to receive(:call!).and_raise(rate_limit_error)
    end

    it 'retries 3 times' do
      perform_enqueued_jobs do
        expect do
          described_class.perform_later(users_result.id, question.id)
        end.to raise_error(RubyLLM::RateLimitError)
      end

      expect(AI::ContentAnalysis::ScoreQuestion).to have_received(:call!).exactly(4).times
    end
  end

  context 'when a non-transient error occurs' do
    before do
      allow(AI::ContentAnalysis::ScoreQuestion).to receive(:call!).and_raise(StandardError.new('Permanent failure'))
    end

    it 'does not retry' do
      perform_enqueued_jobs do
        expect do
          described_class.perform_later(users_result.id, question.id)
        end.to raise_error(StandardError)
      end

      expect(AI::ContentAnalysis::ScoreQuestion).to have_received(:call!).exactly(:once)
    end
  end
end
