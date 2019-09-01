require 'rails_helper'

describe Assigns::CalculateInnovationStyles do
  let(:assign) { create(:assign) }
  let(:dimension) { assign.assessment.dimension }
  let(:factor1) { create(:factor, dimension: dimension) }
  let(:factor2) { create(:factor, dimension: dimension) }

  # InnovationStyle and InnovationStylesFactor #1
  let(:innovation_style1) { create(:innovation_style, dimension: dimension) }
  let(:innovation_styles_factor1_1) { create(:innovation_styles_factor, innovation_style: innovation_style1, factor: factor1) }
  let(:innovation_styles_factor1_2) { create(:innovation_styles_factor, innovation_style: innovation_style1, factor: factor2) }

  # InnovationStyle and InnovationStylesFactor #2
  let(:innovation_style2) { create(:innovation_style, dimension: dimension) }
  let(:innovation_styles_factor2_1) { create(:innovation_styles_factor, innovation_style: innovation_style2, factor: factor1) }

  it '.call!' do
    expect(described_class).to respond_to(:'call!').with_unlimited_arguments
  end

  context '#condition_valid?' do
    subject { described_class.new(assign).send(:condition_valid?, innovation_styles_factor1_1, avg_scoring) }
    let(:innovation_styles_factor1_1) { create(:innovation_styles_factor, innovation_style: innovation_style1, factor: factor1, predicate: predicate, value: 3.0) }

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
