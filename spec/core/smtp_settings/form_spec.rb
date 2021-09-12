# frozen_string_literal: true

require 'rails_helper'

describe SmtpSettings::Form do
  let(:attributes) { attributes_for(:smtp_setting) }

  it "doen't validate if smtp_setting is not enabled" do
    form = described_class.new(attributes.merge(from_name: nil, from_email: nil, enabled: false))

    expect(form.valid?).to eq(true)
  end

  it 'checks presence of from_name is smtp_setting is enabled' do
    form = described_class.new(attributes.merge(enabled: true, from_name: nil))

    expect(form.valid?).to eq(false)
    expect(form.errors[:from_name]).to eq(["can't be blank"])
  end

  it "doesn't check for validation of fields other than from_name if all other fields are nil,blank or not passed" do
    form = described_class.new(enabled: true, from_name: 'James', from_email: nil, port: '')

    expect(form.valid?).to eq(true)
  end

  it 'checks presennce validation for all fields if host if present' do
    form = described_class.new(
      attributes.merge(enabled: true, host: 'james.cc', port: nil, from_name: nil, from_email: nil, encryption: nil)
    )

    expect(form.valid?).to eq(false)
    expect(form.errors[:from_name]).to eq(["can't be blank"])
    expect(form.errors[:from_email]).to eq(["can't be blank"])
    expect(form.errors[:port]).to eq(["can't be blank"])
  end

  it 'checks presence of authentication related fields if authentication is true' do
    form = described_class.new(
      attributes.merge(enabled: true, authentication: true, user_name: '', password: '', authentication_type: nil)
    )

    expect(form.valid?).to eq(false)
    expect(form.errors[:user_name]).to eq(["can't be blank"])
    expect(form.errors[:password]).to eq(["can't be blank"])
    expect(form.errors[:authentication_type]).to eq(["can't be blank"])
  end

  it "doesn't check presence of authentication related fields if authentication is false" do
    form = described_class.new(
      attributes.merge(enabled: true, authentication: false, user_name: '', password: '', authentication_type: nil)
    )

    expect(form.valid?).to eq(true)
  end
end
