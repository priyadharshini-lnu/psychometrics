# frozen_string_literal: true

require 'rails_helper'

describe Threesixty::Subjects::ImportOneForm do
  it 'validates presence of first_name' do
    form = described_class.new(first_name: '')
    form.validate

    expect(form.errors.messages[:first_name]).to include("First name can't be blank")
  end

  it 'validates presence of last_name' do
    form = described_class.new(last_name: '')
    form.validate

    expect(form.errors.messages[:last_name]).to include("Last name can't be blank")
  end

  it 'validates presence of email' do
    form = described_class.new(email: '')
    form.validate

    expect(form.errors.messages[:email]).to include("Email can't be blank")
  end

  it 'validates email' do
    form = described_class.new(email: 'invalid')
    form.validate

    expect(form.errors.messages[:email]).to include('Email is invalid')
  end
end
