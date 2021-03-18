# frozen_string_literal: true

require 'rails_helper'

describe AgileScoring::Slider do
  it 'returns answers multiplied by itemScore' do
    result = described_class.new.calculate(nil, { 'answers' => ['2'] }, { 'itemScore' => 3 })

    expect(result).to eq(6)
  end
end
