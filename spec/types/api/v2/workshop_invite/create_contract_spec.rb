# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::WorkshopInvite::CreateContract do
  let(:user) { create(:user) }
  let(:workshop) { create(:workshop) }

  let(:valid_params) do
    jsonapi_resource_request(
      'workshop_invites',
      {
        allowed_languages: ['en'],
        allow_language_preference: false,
        allow_neurodiversity_option: false,
        workshop_ids: [workshop.id.to_s],
        subjects: [{ user_id: user.id.to_s }],
        translations: [{ locale: 'en', title: 'Title', description: 'description' }]
      }
    )
  end

  it 'validates params and subjects/workshops count' do
    contract = described_class.new.call(valid_params, {})

    expect(contract.failure?).to eq(false)
  end

  it 'fail if workshops count more than expected' do
    valid_params[:data][:attributes][:workshop_ids] = (1..11).map(&:to_s)
    contract = described_class.new.call(valid_params, {})

    expect(contract.failure?).to eq(true)
    expect(contract).to have_jsonapi_attr_error(workshop_ids: ['You can only add 10 assessment centers per invite'])
  end
end
