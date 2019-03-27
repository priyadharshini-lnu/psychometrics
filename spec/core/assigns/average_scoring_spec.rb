require 'rails_helper'

describe Assigns::AverageScoring do
  let(:factor) { double(:factor, id: 1, parent_id: 2) }
  let(:scoring) {
    {
      '1' => {
        'name' => 'Factor Name',
        'results' => [
          {
            'value' => 3.0,
            'question_id' => 1
          },
          {
            'value' => 4.0,
            'question_id' => 2
          }
        ]
      }
    }
  }

  it '.call!' do
    expect(described_class).to respond_to(:'call!').with_unlimited_arguments
  end

  context 'calculate' do
    subject { described_class.call!(scoring, factor) }

    it 'a correct avg scoring' do
      is_expected.to eq(3.5)
    end

    it '0 if no results' do
      scoring['1']['results'] = []
      is_expected.to be_zero
    end

    it '0 if no factor' do
      scoring['2'] = scoring.delete('1')
      is_expected.to be_zero
    end

    it 'nil if no scoring' do
      scoring.delete('1')
      is_expected.to be_nil
    end

    context 'sub_factors' do
      let(:factor) { double(:factor, id: 1, parent_id: nil, sub_factor_ids: [2]) }

      it 'a correct avg scoring' do
        scoring['2'] = scoring.delete('1')
        is_expected.to eq(3.5)
      end
    end
  end
end
