# frozen_string_literal: true

require 'rails_helper'

describe Questions::Validations::MatchRegexp do
  it 'should be valid' do
    expect(described_class.call!('aaa', 'aaa')).to be_falsey
  end

  it 'should be ivalid' do
    expect(described_class.call!('aaa', 'test')).to be_truthy
  end
end
