# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Administration::Campaigns::SmsRecordsController, type: :controller do
  let(:current_user) { create(:superadmin) }
  let(:campaign) { create(:campaign) }

  before(:each) { login_user(current_user) }
  after(:each) { sign_out(current_user) }

  describe 'GET create' do
    it 'create sms_record and schedules send_sms_invites admin job is params are valid' do
      message = Faker::Lorem.characters(number: 5)
      link_expiry = DateTime.now

      expect(AdminJob).to receive(:call)
      post :create, params: {
        new_campaign_id: campaign.id, resource: { link_expiry: link_expiry, message: message }
      }, format: :json

      sms_record = campaign.sms_records.find_by(message: message)
      expect(sms_record).to_not eq(nil)
      expect(sms_record.link_expiry).to be_within(1.second).of link_expiry
      expect(response.status).to eq(200)
    end

    it "doesn't create sms_record and schedules send_sms_invites admin job is params are invalid" do
      expect(AdminJob).to_not receive(:call)
      post :create, params: { new_campaign_id: campaign.id, resource: { link_expiry: DateTime.now } }, format: :json

      parsed_response = response.parsed_body
      expect(campaign.sms_records.exists?).to eq(false)
      expect(response.status).to eq(422)
      expect(parsed_response).to eq({ 'errors' => { 'message' => ["can't be blank"] } })
    end
  end
end
