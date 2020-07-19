# frozen_string_literal: true

require 'rails_helper'

describe Campaigns::Users::EditForm do
  let(:attributes) { { first_name: 'John', last_name: 'Doe', email: 'john@cc.com' } }

  it 'validates presence of first_name' do
    form = described_class.new(attributes.merge(first_name: ''))

    expect(form.valid?).to eq(false)
    expect(form.errors[:first_name]).to include("can't be blank")
  end

  it 'validates presence of last_name' do
    form = described_class.new(attributes.merge(last_name: ''))

    expect(form.valid?).to eq(false)
    expect(form.errors[:last_name]).to include("can't be blank")
  end

  it 'validates presence email' do
    form = described_class.new(attributes.merge(email: ''))

    expect(form.valid?).to eq(false)
    expect(form.errors[:email]).to include("can't be blank")
  end

  it 'validates format email' do
    form = described_class.new(attributes.merge(email: 'john'))

    expect(form.valid?).to eq(false)
    expect(form.errors[:email]).to include('is invalid')
  end
end
