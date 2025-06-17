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
        campaign_assessment_group_id: '1',
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
end
