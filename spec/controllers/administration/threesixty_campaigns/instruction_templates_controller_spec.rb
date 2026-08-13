# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Administration::ThreesixtyCampaigns::InstructionTemplatesController, type: :controller do
  let!(:client) { create(:tenancy) }
  let!(:template) { create(:threesixty_instruction_template, content: 'En') }
  let(:current_user) { create(:superadmin) }

  before(:each) { login_user(current_user) }
  after(:each) { sign_out(current_user) }

  it 'show locales for a certain template' do
    Mobility.with_locale('ar') do
      template.update(content: 'Ar')
    end

    # The route segment is a Campaign id despite its name; the controller finds by campaign_id.
    get :show, params: {
      locales: %w[en ar],
      threesixty_campaign_id: template.threesixty_campaign.campaign_id,
      id: template.id
    }, as: :json

    parsed_response = response.parsed_body

    expect(response.status).to eq(200)
    expect(parsed_response['list']).to eq([
      {
        'id' => template.id,
        'locale' => 'en',
        'content' => 'En'
      },
      {
        'id' => template.id,
        'locale' => 'ar',
        'content' => 'Ar'
      }
    ])
    expect(parsed_response['available_locales']).to match_array(%w[en ar])
  end
end
