# frozen_string_literal: true

require 'rails_helper'

describe Questions::Validations::Custom::NotSelected do
  it 'should be truthy' do
    expect(described_class.call!({ 'answer' => '0' }, ['0'])).to be_falsey
  end

  it 'should be falsey' do
    expect(described_class.call!({ 'answer' => '0' }, ['1'])).to be_truthy
  end
end
