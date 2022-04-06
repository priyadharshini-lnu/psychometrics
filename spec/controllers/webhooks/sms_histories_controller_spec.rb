# frozen_string_literal: true

require 'rails_helper'

describe Webhooks::SmsHistoriesController, type: :controller do
  let(:sms_history) { create(:sms_history, twilio_sid: 'sid123') }
  let(:sms_history_token) do
    JWT.encode(
      { data: sms_history.id, exp: 1.day.from_now.to_i },
      Rails.application.secrets.webhook_jwt_secret
    )
  end
  let(:price) { '-0.003' }
  let(:num_segments) { '2' }

  before do
    allow(Sms::TwilioClient).to receive_message_chain(:get, :messages, :fetch).
      and_return(double(price: price, num_segments: num_segments))
  end

  describe 'POST status' do
    it 'saves sms_history status' do
      post :status, params: { token: sms_history_token }, body: URI.encode_www_form('MessageStatus' => 'delivered')

      expect(sms_history.reload.status).to eq('delivered')
    end

    it "doesn't fetches message from Twilio if price is already updated" do
      sms_history.update!(price: 0.12)
      expect(Sms::TwilioClient).to_not receive(:get)
      post :status, params: { token: sms_history_token }, body: URI.encode_www_form('MessageStatus' => 'delivered')

      expect(sms_history.reload.price).to eq(0.12)
    end

    it 'saves price and segment_length received from twilio' do
      post :status, params: { token: sms_history_token }, body: URI.encode_www_form('MessageStatus' => 'delivered')
      sms_history.reload

      expect(sms_history.price).to eq(price.to_f.abs)
      expect(sms_history.segment_length).to eq(num_segments.to_i)
    end
  end
end
