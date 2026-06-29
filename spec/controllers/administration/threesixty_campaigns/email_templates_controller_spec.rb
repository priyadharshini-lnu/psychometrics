# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Administration::ThreesixtyCampaigns::EmailTemplatesController, type: :controller do
  let!(:client) { create(:tenancy) }
  let!(:campaign) { create(:campaign, project: client) }
  let!(:threesixty_campaign) { create(:threesixty_campaign, campaign: campaign) }
  let!(:template) do
    create(:threesixty_email_template, content: 'En', subject: 'Sub', threesixty_campaign: threesixty_campaign)
  end
  let(:current_user) { create(:superadmin) }

  before(:each) { sign_in(current_user) }
  after(:each) { sign_out(current_user) }

  it 'show locales for a certain template' do
    Mobility.with_locale('ar') do
      template.update(content: 'Ar')
    end

    get :show, params: {
      locales: %w[en ar],
      threesixty_campaign_id: threesixty_campaign.id,
      id: template.id
    }, as: :json

    parsed_response = response.parsed_body

    expect(response.status).to eq(200)
    expect(parsed_response['list']).to eq([
      {
        'id' => template.id,
        'locale' => 'en',
        'content' => 'En',
        'subject' => 'Sub'
      },
      {
        'id' => template.id,
        'locale' => 'ar',
        'content' => 'Ar',
        'subject' => 'Sub'
      }
    ])
    expect(parsed_response['available_locales']).to match_array(%w[en ar])
  end
end
