require 'rails_helper'

describe Assigns::CalculateOccupations do
  let(:assign) { create(:assign) }
  let(:dimension) { assign.assessment.dimension }
  let(:factor1) { create(:factor, dimension: dimension) }
  let(:factor2) { create(:factor, dimension: dimension) }

  # Occupation and OccupationsFactor #1
  let(:occupation1) { create(:occupation, dimension: dimension) }
  let(:occupations_factor1_1) { create(:occupations_factor, occupation: occupation1, factor: factor1) }
  let(:occupations_factor1_2) { create(:occupations_factor, occupation: occupation1, factor: factor2) }

  # Occupation and OccupationsFactor #2
  let(:occupation2) { create(:occupation, dimension: dimension) }
  let(:occupations_factor2_1) { create(:occupations_factor, occupation: occupation2, factor: factor1) }

  it '.call!' do
    expect(described_class).to respond_to(:'call!').with_unlimited_arguments
  end

  context '#condition_valid?' do
    subject { described_class.new(assign).send(:condition_valid?, occupations_factor1_1, avg_scoring) }
    let(:occupations_factor1_1) { create(:occupations_factor, occupation: occupation1, factor: factor1, predicate: predicate, value: 3.0) }

    context 'equal_to' do
      let(:predicate) { 'equal_to' }
      let!(:avg_scoring) { 3.0 }

      it 'pass' do
        is_expected.to be_truthy
      end

      xit 'not pass' do
        avg_scoring += 3.1
        is_expected.to be_falsy
      end
    end
  end
end
