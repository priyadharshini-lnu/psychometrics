# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::User::CreateGlobalAssessorContract do
  let(:user) { create(:client_admin) }

  it 'checks if email is passed' do
    params = jsonapi_resource_request('users')
    schema = described_class.new.call(params, { user: user })

    expect(schema.failure?).to eq(true)
    expect(schema).to have_jsonapi_attr_error({ email: ["can't be blank"] })
  end

  it 'checks if email is valid' do
    params = jsonapi_resource_request('users', { email: 'agh' })
    schema = described_class.new.call(params, { user: user })

    expect(schema.failure?).to eq(true)
    expect(schema).to have_jsonapi_attr_error({ email: ['Email is invalid'] })
  end
end
