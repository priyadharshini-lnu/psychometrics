# frozen_string_literal: true

require 'rails_helper'

RSpec.describe UpdateSmsHistoryJob, type: :job do
  include ActiveJob::TestHelper

  let(:sid) { 'sid123' }
  let(:sms_history) { create(:sms_history, twilio_sid: sid) }
  let(:price) { '-0.003' }
  let(:num_segments) { '2' }

  subject(:job) { described_class.perform_later(sms_history) }

  it 'saves price and segment_length received from twilio' do
    allow(Sms::TwilioClient).to receive_message_chain(:get, :messages, :fetch).
      and_return(double(price: price, num_segments: num_segments))
    perform_enqueued_jobs { job }
    sms_history.reload

    expect(sms_history.price).to eq(price.to_f.abs)
    expect(sms_history.segment_length).to eq(num_segments.to_i)
  end

  it 'raise exception is num_segments is nil' do
    allow(Sms::TwilioClient).to receive_message_chain(:get, :messages, :fetch).
      and_return(double(price: price, num_segments: nil))

    perform_enqueued_jobs do
      expect { job }.to raise_exception(
        StandardError, "Price or num_of_segments not present for twilio message with sid #{sid}"
      )
    end
  end

  it 'raise exception is price is nil' do
    allow(Sms::TwilioClient).to receive_message_chain(:get, :messages, :fetch).
      and_return(double(price: nil, num_segments: num_segments))

    perform_enqueued_jobs do
      expect { job }.to raise_exception(
        StandardError, "Price or num_of_segments not present for twilio message with sid #{sid}"
      )
    end
  end

  after do
    clear_enqueued_jobs
    clear_performed_jobs
  end
end
