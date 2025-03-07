# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Administration::Campaigns::SmsInvitesController, type: :controller do
  let(:current_user) { create(:superadmin) }
  let(:campaign) { create(:campaign) }

  before(:each) { login_user(current_user) }
  after(:each) { sign_out(current_user) }

  describe 'GET index' do
    it 'renders sms_invites' do
      sms_invites = create_list(:sms_invite, 2, campaign: campaign)

      get :index, params: { new_campaign_id: campaign.id }, format: :json
      parsed_response = response.parsed_body

      expect(parsed_response['total']).to eq(2)
      expect(parsed_response['permissions']).to eq({
        'import' => true,
        'export' => true,
        'send_sms' => true,
        'create' => true,
        'destroy' => true,
        'update' => true
      })
      expect(parsed_response['list']).to match_array(
        [
          expected_sms_invite_response(sms_invites[0]),
          expected_sms_invite_response(sms_invites[1])
        ]
      )
    end

    it 'can search through sms_invites' do
      sms_invite1 = create(:sms_invite, campaign: campaign, first_name: 'Jane')
      create(:sms_invite, campaign: campaign, first_name: 'Danny')

      get :index, params: { new_campaign_id: campaign.id, filters: { filterable_fields: 'Jan' } }, format: :json
      parsed_response = response.parsed_body

      expect(parsed_response['total']).to eq(1)
      expect(parsed_response['list']).to match_array([expected_sms_invite_response(sms_invite1)])
    end

    it 'exports sms_invites csv' do
      sms_invites = create_list(:sms_invite, 2, campaign: campaign)

      get :index, format: 'csv', params: { new_campaign_id: campaign.id }
      parsed_response = CSV.parse(response.body)
      expect(parsed_response.length).to eq(3)
      expect(parsed_response[0]).to eq(SmsInvites::ImportForm::VALID_HEADERS)
      expect(parsed_response[1..]).to match_array([
        expected_sms_invite_export(sms_invites[0]),
        expected_sms_invite_export(sms_invites[1])
      ])
    end
  end

  describe 'import' do
    it 'create AdminJobRecord for processing import if csv is valid' do
      file = Rack::Test::UploadedFile.new(
        Rails.root.join('spec/fixtures/files/sms_invites/valid_import_file.csv'), 'text/csv'
      )
      post :import, params: { new_campaign_id: campaign.id, file: file }
      expect(AdminJobRecord.exists?(operation: 'import_sms_invites')).to eq(true)
    end

    it "doesn't create AdminJobRecord if csv is invalid" do
      file = Rack::Test::UploadedFile.new(
        Rails.root.join('spec/fixtures/files/sms_invites/invalid_import_file.csv'), 'text/csv'
      )
      post :import, params: { new_campaign_id: campaign.id, file: file }
      expect(AdminJobRecord.exists?(operation: 'import_sms_invites')).to eq(false)
    end
  end

  private

  def expected_sms_invite_export(sms_invite)
    [
      sms_invite.first_name,
      sms_invite.last_name,
      sms_invite.mobile_no,
      sms_invite.locale
    ]
  end

  def expected_sms_invite_response(sms_invite)
    {
      'id' => sms_invite.id,
      'first_name' => sms_invite.first_name,
      'last_name' => sms_invite.last_name,
      'mobile_no' => sms_invite.mobile_no,
      'email' => sms_invite.email,
      'locale' => sms_invite.locale,
      'status' => sms_invite.status,
      'created_by' => sms_invite.creator.decorate.full_name,
      'created_at' => I18n.l(sms_invite.created_at, format: :short)
    }
  end
end
