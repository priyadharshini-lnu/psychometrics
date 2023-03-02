# frozen_string_literal: true

require 'rails_helper'

describe Users::AdminProfileEditForm do
  let(:current_password) { Faker::Internet.password(min_length: 10, mix_case: true, special_characters: true) }
  let(:new_password) { Faker::Internet.password(min_length: 10, mix_case: true, special_characters: true) }
  let(:user) { create(:user, :with_project_membership, password: current_password) }

  let(:valid_params) do
    {
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      current_password: current_password,
      password: new_password,
      password_confirmation: new_password,
      change_password: true
    }
  end

  it 'is valid if all valid params is provided' do
    form = described_class.new(valid_params).with_context(current_user: user)

    expect(form.valid?).to eq(true)
  end

  it 'validates password presence if change_password is true' do
    password_blank_params = valid_params.merge(password: '')
    form = described_class.new(password_blank_params).with_context(current_user: user)

    expect(form.valid?).to eq(false)
    expect(form.errors.messages[:password]).to include("can't be blank")
  end

  it "doesn't validates password presence if change_password is false" do
    password_blank_params = valid_params.merge(password: '', change_password: false)
    form = described_class.new(password_blank_params).with_context(current_user: user)

    expect(form.valid?).to eq(true)
  end
end
