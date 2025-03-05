# frozen_string_literal: true

require 'rails_helper'

describe UsersResults::Scoring::GetZscoreForFactor do
  it 'percentile norm' do
    factor = create(:factor, scoring_strategy: :questions)
    factors_norm = create(:factors_norm, factor: factor,
       props: [{ 'mean' => 1, 'standard_deviation' => 3 }])
    result = described_class.call!(factor, 1.5, factors_norm)

    expect(result).to eq(0.16667)
  end
end
