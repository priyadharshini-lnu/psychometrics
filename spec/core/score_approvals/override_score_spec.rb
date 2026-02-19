# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ScoreApprovals::OverrideScore do
  let(:current_user) { create(:user) }
  let(:factor_score) { create(:ai_factor_score) }
  let(:score) { 4.5 }
  let(:reason) { 'Score adjusted due to manual review' }
  let(:params) { { score: score, reason: reason, not_applicable: false } }
  let(:updated_dependent_scores) { [create(:ai_factor_score), create(:ai_factor_score)] }

  before do
    stub_wisper_publisher('AI::ContentAnalysis::UpdateDependentFactorScores', :call, :ok, updated_dependent_scores)
  end

  describe '#call' do
    context 'when override is successful' do
      it 'updates factor score with override data' do
        described_class.call(factor_score, params, current_user)

        factor_score.reload
        expect(factor_score.override_score).to eq(score)
        expect(factor_score.not_applicable).to be_falsey
      end

      it 'sets change log data with user information' do
        described_class.call(factor_score, params, current_user)

        factor_score.reload
        expect(factor_score.versions.last.meta).to include(
          'change_event' => 'override_score',
          'reason' => reason,
          'user_id' => current_user.id,
          'user_name' => current_user.name
        )
      end

      it 'broadcasts success with updated scores' do
        result = described_class.call(factor_score, params, current_user)

        expect(result[:ok]).to contain_exactly(*updated_dependent_scores, factor_score)
      end

      it 'calls dependency update service' do
        expect_any_instance_of(AI::ContentAnalysis::UpdateDependentFactorScores).to receive(:call)

        described_class.call(factor_score, params, current_user)
      end
    end

    context 'when not_applicable is true' do
      let(:params) { { score: score, reason: reason, not_applicable: true } }

      it 'sets not_applicable to true' do
        described_class.call(factor_score, params, current_user)

        factor_score.reload
        expect(factor_score.not_applicable).to be_truthy
        expect(factor_score.override_score).to eq(score)
      end
    end

    context 'when dependency update fails' do
      let(:error_message) { 'Dependency update failed' }

      before do
        stub_wisper_publisher('AI::ContentAnalysis::UpdateDependentFactorScores', :call, :error, error_message)
      end

      it 'broadcasts error and rolls back transaction' do
        result = described_class.call(factor_score, params, current_user)

        expect(result[:error]).to eq(error_message)
        expect(result[:ok]).to be_nil
      end

      it 'does not persist factor score changes on rollback' do
        original_score = factor_score.override_score
        original_not_applicable = factor_score.not_applicable

        described_class.call(factor_score, params, current_user)

        factor_score.reload
        expect(factor_score.override_score).to eq(original_score)
        expect(factor_score.not_applicable).to eq(original_not_applicable)
      end
    end

    context 'when factor_score update fails' do
      before do
        allow(factor_score).to receive(:update!).and_raise(ActiveRecord::RecordInvalid)
      end

      it 'raises the error and rolls back transaction' do
        expect { described_class.call(factor_score, params, current_user) }.to raise_error(ActiveRecord::RecordInvalid)
      end
    end

    context 'with minimal params' do
      let(:params) { { score: score, reason: reason } }

      it 'defaults not_applicable to false' do
        described_class.call(factor_score, params, current_user)

        factor_score.reload
        expect(factor_score.not_applicable).to be_falsey
      end
    end
  end
end
