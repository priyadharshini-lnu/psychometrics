# frozen_string_literal: true

require 'rails_helper'

describe Occupations::CalculateStars do
  it 'calculates stars given value' do
    stars = described_class.call!(nil)
    expect(stars).to eq(0)
    stars = described_class.call!(0.5)
    expect(stars).to eq(1)
    stars = described_class.call!(0.6)
    expect(stars).to eq(2)
    stars = described_class.call!(0.7)
    expect(stars).to eq(3)
    stars = described_class.call!(0.8)
    expect(stars).to eq(4)
    stars = described_class.call!(0.85)
    expect(stars).to eq(5)
  end
end
