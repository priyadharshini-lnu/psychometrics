# frozen_string_literal: true

require 'rails_helper'

describe Questions::Validation do
  let(:question) do
    create(:question, validation: {
      'type' => 'Custom',
      'customValidations' => [{
        'conditions' => [{ 'answer' => 'TextField', 'predicate' => 'MatchesRegexp',
                           'type' => 'input', 'value' => 'aaa' }],
        'message' => 'error'
      }]
    })
  end

  it 'should be valid' do
    expect(described_class.call!(question, 'aaa')).to be_nil
  end

  it 'should be ivalid' do
    expect(described_class.call!(question, 'test')).to match_array(%w[error])
  end
end
