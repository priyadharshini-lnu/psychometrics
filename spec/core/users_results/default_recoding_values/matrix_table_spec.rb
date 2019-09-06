# frozen_string_literal: true

require 'rails_helper'

describe ::UsersResults::DefaultRecodingValues::MatrixTable do
  let(:question) { create(:question, type: 'MatrixTable', props: { 'choices' => 3, 'scalePoints' => 2 }) }

  it do
    expected_values = [
      { 'scale' => 0, 'value' => 1, 'choice' => 0 },
      { 'scale' => 1, 'value' => 2, 'choice' => 0 },
      { 'scale' => 0, 'value' => 1, 'choice' => 1 },
      { 'scale' => 1, 'value' => 2, 'choice' => 1 },
      { 'scale' => 0, 'value' => 1, 'choice' => 2 },
      { 'scale' => 1, 'value' => 2, 'choice' => 2 }
    ]
    expect(described_class.call!(question)).to eq(expected_values)
  end
end
