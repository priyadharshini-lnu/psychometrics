# frozen_string_literal: true

require 'rails_helper'

describe Questions::Validations::Custom::Empty do
  it 'should be falsey' do
    expect(described_class.call!(nil, 'aa')).to be_falsey
  end

  it 'should be truthy' do
    expect(described_class.call!(nil, nil)).to be_truthy
  end

  it 'should be truthy' do
    expect(described_class.call!(nil, '')).to be_truthy
  end
end
