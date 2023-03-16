# frozen_string_literal: true

require 'rails_helper'

describe Questions::Validations::Custom::MatchRegexp do
  it 'should be truthy' do
    expect(described_class.call!({ 'value' => 'aaa' }, 'aaa')).to be_truthy
  end

  it 'should be falsey' do
    expect(described_class.call!({ 'value' => 'aaa' }, 'test')).to be_falsey
  end
end
