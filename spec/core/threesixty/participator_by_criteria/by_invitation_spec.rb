# frozen_string_literal: true

require 'rails_helper'

describe Threesixty::ParticipatorByCriteria::ByInvitation do
  let(:threesixty_campaign) { create(:threesixty_campaign) }
  let!(:threesixty_option) { create(:threesixty_option, threesixty_campaign: threesixty_campaign) }
  let(:threesixty_subjects) do
    [
      create(:threesixty_subject, created_at: '2019-08-23T17:46:30+03:00'.to_datetime)
    ] + create_list(:threesixty_subject, 2, campaign: threesixty_campaign.campaign, created_at: '2019-08-24T17:46:30+03:00'.to_datetime)
  end

  it 'not_received criteria' do
    criteria_list = [{ 'field' => 'invitation', 'sub_field' => 'not_received' }]
    results = described_class.call!(
      threesixty_campaign: threesixty_campaign,
      participators: threesixty_subjects,
      criteria_list: criteria_list
    )

    expect(results).to eq([])
  end

  it 'received_after criteria' do
    criteria_list = [{ 'field' => 'invitation', 'sub_field' => 'received_after', 'value' => '2019-08-24T07:46:30+03:00' }]
    results = described_class.call!(
      threesixty_campaign: threesixty_campaign,
      participators: threesixty_subjects,
      criteria_list: criteria_list
    )

    expect(results).to match_array(threesixty_subjects[1..2])
  end
end
