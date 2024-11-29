# frozen_string_literal: true

require 'rails_helper'

describe CsvInjectionCheckValidator do
  with_model :user do
    table do |t|
      t.string :first_name
    end

    model do
      validates :first_name, csv_injection_check: true
    end
  end

  it 'is invalid if it starts with @' do
    expect(User.new(first_name: '@john').valid?).to eq(false)
  end

  it 'is invalid if it starts with =' do
    expect(User.new(first_name: '=john').valid?).to eq(false)
  end

  it 'is invalid if it starts with +' do
    expect(User.new(first_name: '+john').valid?).to eq(false)
  end

  it 'is invalid if it starts with -' do
    expect(User.new(first_name: '-john').valid?).to eq(false)
  end

  it 'is invalid if it starts with %' do
    expect(User.new(first_name: '%john').valid?).to eq(false)
  end

  it 'is invalid if it starts with |' do
    expect(User.new(first_name: '|john').valid?).to eq(false)
  end

  it 'is invalid if it starts with \t' do
    expect(User.new(first_name: "\tjohn").valid?).to eq(false)
  end

  it 'is invalid if it starts with \r' do
    expect(User.new(first_name: "\rjohn").valid?).to eq(false)
  end

  it 'is valid if it does not start with invalid characters' do
    expect(User.new(first_name: 'john').valid?).to eq(true)
  end
end
