# frozen_string_literal: true

require 'rails_helper'

RSpec.describe UsersResults::RescoreOccupationsJob, type: :job do
  describe '#perform' do
    let(:dimension) { create(:dimension, occupations_enabled: true) }
    let(:condition_set) { dimension.default_occupation_condition_set }
    let(:user_assessment) { create(:user_assessment) }
    let!(:users_result) do
      create(:users_result, user_assessment: user_assessment, occupation_condition_set: condition_set)
    end
    before do
      allow(UsersResults::CalculateOccupations).to receive(:call!).with(
        users_result
      ).and_return({ 'some_occupation' => 100 })
    end

    it 'recalculates and updates occupation scores' do
      described_class.new.perform([users_result.id], condition_set.id)

      expect(users_result.reload.occupations).to eq({ 'some_occupation' => 100 })
    end

    context 'when users_result belongs to a different condition set' do
      it 'skips rescoring for that result' do
        other_condition_set = create(:occupation_condition_set, dimension: dimension, name: 'Other')
        other_result = create(:users_result, user_assessment: create(:user_assessment),
                                             occupation_condition_set: other_condition_set)

        expect(UsersResults::CalculateOccupations).not_to receive(:call!).with(other_result)

        described_class.new.perform([other_result.id], condition_set.id)
      end
    end
  end
end
