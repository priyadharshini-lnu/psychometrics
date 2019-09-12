# frozen_string_literal: true

require 'rails_helper'

describe Threesixty::Subjects::GetEvaluationsReceived do
  let!(:threesixty_campaign) { create(:threesixty_campaign) }
  let!(:threesixty_option) { create(:threesixty_option, threesixty_campaign: threesixty_campaign) }
  let!(:threesixty_subjects) { create_list(:threesixty_subject, 2, campaign: threesixty_campaign.campaign) }

  it 'returns total evaluations completed by user' do
    2.times do
      participant = create(:threesixty_participant,
                           campaign: threesixty_campaign.campaign, subject_id: threesixty_subjects[0].user_id)
      create(
        :users_result,
        campaign: threesixty_campaign.campaign,
        subject_id: threesixty_subjects[0].user_id,
        evaluator_id: participant.evaluator_id,
        status: :completed
      )
    end
    participant = create(:threesixty_participant,
                         campaign: threesixty_campaign.campaign, subject_id: threesixty_subjects[1].user_id)
    create(
      :users_result,
      campaign: threesixty_campaign.campaign,
      subject_id: threesixty_subjects[1].user_id,
      evaluator_id: participant.evaluator_id,
      status: :completed
    )

    results = described_class.call!(threesixty_campaign, threesixty_subjects.map(&:user_id))

    expect(results[threesixty_subjects[0].user_id]).to eq(2)
    expect(results[threesixty_subjects[1].user_id]).to eq(1)
  end
end
