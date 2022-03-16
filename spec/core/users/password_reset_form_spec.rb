# frozen_string_literal: true

require 'rails_helper'

describe Users::PasswordResetForm do
  it 'validates presence of email' do
    form = described_class.new(email: nil).with_context(subdomain: nil)
    form.valid?

    expect(form.errors.messages[:email]).to include("can't be blank")
  end

  it 'validates email format' do
    form = described_class.new(email: 'abc').with_context(subdomain: nil)
    form.valid?

    expect(form.errors.messages[:email]).to include('is invalid')
  end
end
