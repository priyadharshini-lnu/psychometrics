# frozen_string_literal: true

require 'rails_helper'

describe Threesixty::Evaluators::CreateAll do
  let(:project) { create(:project) }
  let(:campaign) { create(:campaign, project: project) }
  let(:threesixty_campaign) { create(:threesixty_campaign, campaign: campaign) }
  let!(:subject_1) do
    user = create(:user, project: project, email: 'fedor@gmail.com')
    create(:campaigns_user, user: user, campaign: campaign)
    create(:threesixty_subject, user: user, campaign: campaign)
  end
  let!(:relationship) { create(:relationship, name: 'peer', campaign: campaign) }
  let!(:subject_2) do
    user = create(:user, project: project, email: 'ivan@gmail.com')
    create(:campaigns_user, user: user, campaign: campaign)
    create(:threesixty_subject, user: user, campaign: campaign)
  end
  let(:params) do
    [
      { evaluator_email: 'dev.atanov@gmail.com', relationship_name: 'peer', subject: subject_1, relationship: relationship, subject_user: subject_1.user, subject_email: 'fedor@gmail.com' },
      { evaluator_email: 'dev.atanov@gmail.com', relationship_name: 'peer', subject: subject_2, relationship: relationship, subject_user: subject_2.user, subject_email: 'ivan@gmail.com'  }
    ]
  end

  subject { described_class.call!(params, threesixty_campaign) }

  it '.call' do
    participants = subject

    expect(participants.map { |s| s.evaluator.email }).to match_array(%w[dev.atanov@gmail.com dev.atanov@gmail.com])
    expect(participants.map { |s| s.subject.email }).to match_array(%w[ivan@gmail.com fedor@gmail.com])
    expect(participants.map { |s| s.relationship.name }).to match_array(%w[peer peer])
    expect(Threesixty::Evaluator.find_by(user_id: participants.first.evaluator_id).evaluations_count).to eq 2
    expect(Threesixty::Subject.find_by(user_id: participants.first.subject_id).evaluators_count).to eq 1
  end

  it 'creates membership for evaluator' do
    subject.each do |participant|
      membership_exits = threesixty_campaign.project.memberships.exists?(user_id: participant.evaluator_id)
      expect(membership_exits).to eq(true)
    end
  end
end
