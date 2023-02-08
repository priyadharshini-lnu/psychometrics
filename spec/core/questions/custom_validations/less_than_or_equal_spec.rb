# frozen_string_literal: true

require 'rails_helper'

describe Questions::Validations::Custom::LessThanOrEqual do
  it 'should be falsey' do
    expect(described_class.call!({ 'value' => '5' }, '10')).to be_falsey
  end

  it 'should be truthy' do
    expect(described_class.call!({ 'value' => '5' }, '3')).to be_truthy
  end

  it 'should be truthy' do
    expect(described_class.call!({ 'value' => '5' }, '5')).to be_truthy
  end
end
