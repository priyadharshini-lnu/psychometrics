# frozen_string_literal: true

require 'rails_helper'

describe ::UsersResults::DefaultRecodingValues::MultipleChoice do
  let(:question) { create(:question, type: 'MultipleChoice', props: { 'choices' => 4 }) }

  it do
    expected_values = [
      { 'index' => 0, 'value' => 1 },
      { 'index' => 1, 'value' => 2 },
      { 'index' => 2, 'value' => 3 },
      { 'index' => 3, 'value' => 4 }
    ]
    expect(described_class.call!(question)).to eq(expected_values)
  end
end
