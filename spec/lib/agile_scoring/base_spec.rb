# frozen_string_literal: true

require 'rails_helper'

describe AgileScoring::Base do
  it 'returns zero if answer is incorrect' do
    correct_answers = { 'answers' => [[1]] }
    give_answers = { 'answers' => [2] }
    result = described_class.new.calculate(correct_answers, give_answers, { 'itemScore' => 2 })

    expect(result).to eq(0)
  end

  it 'returns itemScore if answer is correct' do
    correct_answers = { 'answers' => [[1]] }
    give_answers = { 'answers' => [1] }
    result = described_class.new.calculate(correct_answers, give_answers, { 'itemScore' => 2 })

    expect(result).to eq(2)
  end
end
