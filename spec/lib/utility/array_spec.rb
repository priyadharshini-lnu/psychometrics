# frozen_string_literal: true

require 'rails_helper'

describe Utility::Array do
  it 'ensures array is shrunk, when provided size is lesser' do
    array = [1, 2, 3, 4, 5]
    expect(described_class.ensure_size(array, 3)).to eq([1, 2, 3])
  end
  it 'ensures array is expanded with blank string, when filler value is not provided' do
    array = [1, 2, 3]
    expect(described_class.ensure_size(array, 4)).to eq([1, 2, 3, ''])
  end
  it 'ensures array is expanded with filler value, when provided array size is lesser' do
    array = [1, 2, 3]
    expect(described_class.ensure_size(array, 4, 'x')).to eq([1, 2, 3, 'x'])
  end
end
