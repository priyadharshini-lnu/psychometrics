# frozen_string_literal: true

require 'rails_helper'

describe Threesixty::Participants::Remove do
  let(:threesixty_campaign) { create(:threesixty_campaign) }
  let(:threesixty_subject) { create(:threesixty_subject, evaluators_count: 1, campaign: threesixty_campaign.campaign) }
  let(:threesixty_evaluator) { create(:threesixty_evaluator, evaluations_count: 1, campaign: threesixty_campaign.campaign) }
  let(:participant) do
    create(
      :participant,
      subject: threesixty_subject.user,
      evaluator: threesixty_evaluator.user,
      campaign: threesixty_campaign.campaign
    )
  end

  before do
    Threesixty::Participants::Remove.call(participant, threesixty_campaign.campaign)
  end

  it 'decrements evaluators_count for subjects' do
    expect(threesixty_subject.reload.evaluators_count).to eq(0)
  end

  it 'decrements evaluations_count for evaluators' do
    expect(threesixty_evaluator.reload.evaluations_count).to eq(0)
  end

  it 'deletes participants records' do
    expect(Participant.find_by(id: participant.id)).to be_nil
  end
end
