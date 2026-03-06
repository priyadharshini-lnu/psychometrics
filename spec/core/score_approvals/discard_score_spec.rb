# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ScoreApprovals::DiscardScore do
  let(:user) { create(:user) }
  let(:factor_score) { create(:ai_factor_score, override_score: 5, not_applicable: true) }

  describe '#call' do
    context 'when successfully discarding score' do
      let(:dependent_scores) { [create(:ai_factor_score), create(:ai_factor_score)] }

      before do
        stub_wisper_publisher('AI::ContentAnalysis::UpdateDependentFactorScores', :call, :ok, dependent_scores)
      end

      it 'updates factor score attributes' do
        described_class.call(factor_score, user)

        factor_score.reload
        expect(factor_score.not_applicable).to be false
        expect(factor_score.override_score).to be_nil
      end

      it 'sets change log data' do
        described_class.call(factor_score, user)

        factor_score.reload
        expect(factor_score.versions.last.meta).to eq({
          'change_event' => 'discard_score',
          'user_id' => user.id,
          'user_name' => user.name
        })
      end

      it 'returns success with updated scores' do
        result = described_class.call(factor_score, user)

        expect(result[:ok]).to include(*dependent_scores, factor_score)
        expect(result[:error]).to be_nil
      end

      it 'includes original factor score in returned scores' do
        result = described_class.call(factor_score, user)

        expect(result[:ok]).to include(factor_score)
      end
    end

    context 'when dependent score update fails' do
      let(:error_message) { 'Failed to update dependent scores' }

      before do
        stub_wisper_publisher('AI::ContentAnalysis::UpdateDependentFactorScores', :call, :error, error_message)
      end

      it 'returns error' do
        result = described_class.call(factor_score, user)

        expect(result[:error]).to eq(error_message)
        expect(result[:ok]).to be_nil
      end

      it 'does not persist changes to factor score' do
        original_override_score = factor_score.override_score
        original_not_applicable = factor_score.not_applicable

        described_class.call(factor_score, user)

        factor_score.reload
        expect(factor_score.override_score).to eq(original_override_score)
        expect(factor_score.not_applicable).to eq(original_not_applicable)
      end
    end

    context 'when database transaction fails' do
      before do
        allow(factor_score).to receive(:update!).and_raise(ActiveRecord::RecordInvalid)
      end

      it 'raises the exception' do
        expect { described_class.call(factor_score, user) }.to raise_error(ActiveRecord::RecordInvalid)
      end
    end
  end
end
