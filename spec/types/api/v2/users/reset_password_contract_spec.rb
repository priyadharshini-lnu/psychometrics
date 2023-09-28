# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::User::ResetPasswordContract do
  let(:user) { create(:client_admin) }

  it 'checks if automatically_generate_password is passed' do
    params = jsonapi_resource_request('users')
    schema = described_class.new.call(params, { user: user })

    expect(schema.failure?).to eq(true)
    expect(schema).to have_jsonapi_attr_error({ automatically_generate_password: ["can't be blank"] })
  end

  it 'checks if password is passed if automatically_generate_password is false' do
    params = jsonapi_resource_request('users', { automatically_generate_password: false })
    schema = described_class.new.call(params, { user: user })

    expect(schema.failure?).to eq(true)
    expect(schema).to have_jsonapi_attr_error({ password: ["can't be blank"] })
  end

  it 'checks if password is valid' do
    params = jsonapi_resource_request('users', { automatically_generate_password: false, password: 'agh' })
    schema = described_class.new.call(params, { user: user })

    expect(schema.failure?).to eq(true)
    expect(schema).to have_jsonapi_attr_error({ password: ['is too short (minimum is 12 characters)'] })
  end
end
