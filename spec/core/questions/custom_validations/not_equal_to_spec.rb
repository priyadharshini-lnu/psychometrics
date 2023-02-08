# frozen_string_literal: true

require 'rails_helper'

describe Questions::Validations::Custom::NotEqualTo do
  it 'should be falsey' do
    expect(described_class.call!({ 'value' => 'aaa' }, 'aaa')).to be_falsey
  end

  it 'should be truthy' do
    expect(described_class.call!({ 'value' => 'aaa' }, 'aa')).to be_truthy
  end
end
