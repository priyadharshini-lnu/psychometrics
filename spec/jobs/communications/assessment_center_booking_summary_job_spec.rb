# frozen_string_literal: true

require 'rails_helper'

describe Communications::AssessmentCenterBookingSummaryJob, type: :job do
  let(:user) { create(:user) }
  let(:communication) do
    create(:communication,
           delivery_timezone: 'UTC',
           kind: :assessment_center_booking_summary,
           delivery_start_date: Time.zone.today,
           delivery_end_date: Time.zone.today + 2.days,
           delivery_time_of_day: '09:00',
           delivery_frequency: 'daily')
  end
  let!(:communications_user) { create(:communications_user, user: user, communication: communication) }

  it 'creates communication emails for each communication user and schedules repeated emails' do
    allow(CommunicationEmailMailer).to receive_message_chain(:create, :deliver_later)
    expect_any_instance_of(Communication).to receive(:schedule_repeated_emails).and_call_original

    expect do
      described_class.perform_now(communication.id)
    end.to change(CommunicationEmail, :count).by(1)

    email = CommunicationEmail.last
    expect(email.communication).to eq(communication)
    expect(email.user).to eq(user)
    expect(CommunicationEmailMailer).to have_received(:create).with(email.id)
  end

  it 'returns early if communication is blank' do
    expect do
      described_class.perform_now(-1)
    end.not_to change(CommunicationEmail, :count)
  end
end
