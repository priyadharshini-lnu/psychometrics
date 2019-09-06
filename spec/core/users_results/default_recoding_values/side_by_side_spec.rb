# frozen_string_literal: true

require 'rails_helper'

describe ::UsersResults::DefaultRecodingValues::SideBySide do
  let(:question) do
    create(:question, type: 'SideBySide', props: { 'choices' => 5, 'scalePoints' => 3, 'columnsData' => [
             { 'answers' => 2 },
             { 'answers' => 3 },
             { 'answers' => 4 }
           ] })
  end

  it do
    expected_values = [
      { 'scale' => 0, 'choice' => 0, 'values' => [{ 'index' => 0, 'value' => 1 }, { 'index' => 1, 'value' => 2 }] },
      { 'scale' => 1, 'choice' => 0, 'values' => [{ 'index' => 0, 'value' => 1 }, { 'index' => 1, 'value' => 2 }, { 'index' => 2,  'value' => 3 }] },
      { 'scale' => 2, 'choice' => 0, 'values' => [{ 'index' => 0, 'value' => 1 }, { 'index' => 1, 'value' => 2 }, { 'index' => 2,  'value' => 3 }, { 'index' => 3, 'value' => 4 }] },
      { 'scale' => 0, 'choice' => 1, 'values' => [{ 'index' => 0, 'value' => 1 }, { 'index' => 1, 'value' => 2 }] },
      { 'scale' => 1, 'choice' => 1, 'values' => [{ 'index' => 0, 'value' => 1 }, { 'index' => 1, 'value' => 2 }, { 'index' => 2,  'value' => 3 }] },
      { 'scale' => 2, 'choice' => 1, 'values' => [{ 'index' => 0, 'value' => 1 }, { 'index' => 1, 'value' => 2 }, { 'index' => 2,  'value' => 3 }, { 'index' => 3, 'value' => 4 }] },
      { 'scale' => 0, 'choice' => 2, 'values' => [{ 'index' => 0, 'value' => 1 }, { 'index' => 1, 'value' => 2 }] },
      { 'scale' => 1, 'choice' => 2, 'values' => [{ 'index' => 0, 'value' => 1 }, { 'index' => 1, 'value' => 2 }, { 'index' => 2,  'value' => 3 }] },
      { 'scale' => 2, 'choice' => 2, 'values' => [{ 'index' => 0, 'value' => 1 }, { 'index' => 1, 'value' => 2 }, { 'index' => 2,  'value' => 3 }, { 'index' => 3, 'value' => 4 }] },
      { 'scale' => 0, 'choice' => 3, 'values' => [{ 'index' => 0, 'value' => 1 }, { 'index' => 1, 'value' => 2 }] },
      { 'scale' => 1, 'choice' => 3, 'values' => [{ 'index' => 0, 'value' => 1 }, { 'index' => 1, 'value' => 2 }, { 'index' => 2,  'value' => 3 }] },
      { 'scale' => 2, 'choice' => 3, 'values' => [{ 'index' => 0, 'value' => 1 }, { 'index' => 1, 'value' => 2 }, { 'index' => 2,  'value' => 3 }, { 'index' => 3, 'value' => 4 }] },
      { 'scale' => 0, 'choice' => 4, 'values' => [{ 'index' => 0, 'value' => 1 }, { 'index' => 1, 'value' => 2 }] },
      { 'scale' => 1, 'choice' => 4, 'values' => [{ 'index' => 0, 'value' => 1 }, { 'index' => 1, 'value' => 2 }, { 'index' => 2,  'value' => 3 }] },
      { 'scale' => 2, 'choice' => 4, 'values' => [{ 'index' => 0, 'value' => 1 }, { 'index' => 1, 'value' => 2 }, { 'index' => 2,  'value' => 3 }, { 'index' => 3, 'value' => 4 }] }
    ]
    expect(described_class.call!(question)).to eq(expected_values)
  end
end
