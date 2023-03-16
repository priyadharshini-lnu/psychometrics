# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::Projects::UpdateContract do
  let(:valid_params) do
    jsonapi_resource_request(
      'projects',
      {
        id: '1',
        name: 'Project Name',
        subdomain: 'project-subdomain',
        number: '123',
        client_id: '1004'
      },
      {}
    )
  end

  it 'link and text should be present if privacy link enabled' do
    params = jsonapi_merge_attributes(valid_params, { enable_privacy_link: true, link: '', text: '' })
    schema = Api::V2::Projects::UpdateContract.new.call(params, {})

    expect(schema.failure?).to eq(true)
    expect(schema).to have_jsonapi_attr_error({ link: ["can't be blank"], text: ["can't be blank"] })
  end

  it 'link and text can be blank if privacy link is not enabled' do
    params = jsonapi_merge_attributes(valid_params, { enable_privacy_link: false, link: '', text: '' })
    schema = Api::V2::Projects::UpdateContract.new.call(params, {})

    expect(schema.failure?).to eq(false)
  end
end
