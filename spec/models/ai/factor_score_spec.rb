# frozen_string_literal: true

require 'rails_helper'

RSpec.describe AI::FactorScore, type: :model do
  describe 'associations' do
    it { is_expected.to belong_to(:users_result) }
    it { is_expected.to belong_to(:question).optional }
    it { is_expected.to belong_to(:factor) }
    it { is_expected.to belong_to(:parent_factor).class_name('Factor').optional }
  end

  describe '#final_score' do
    let(:ai_factor_score) { build(:ai_factor_score, score: 3.5, override_score: nil) }

    context 'when override_score is nil' do
      it 'returns score' do
        expect(ai_factor_score.final_score).to eq(3.5)
      end
    end

    context 'when override_score is present' do
      before { ai_factor_score.override_score = 4.2 }

      it 'returns override_score' do
        expect(ai_factor_score.final_score).to eq(4.2)
      end
    end
  end
end
