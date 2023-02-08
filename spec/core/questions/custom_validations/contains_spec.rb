# frozen_string_literal: true

require 'rails_helper'

describe Questions::Validations::Custom::Contains do
  it 'should be truthy' do
    expect(described_class.call!({ 'value' => 'aa' }, 'aaa')).to be_truthy
  end

  it 'should be falsey' do
    expect(described_class.call!({ 'value' => 'bb' }, 'aaa')).to be_falsey
  end
end
