# frozen_string_literal: true

require 'rails_helper'

describe Threesixty::Evaluators::CreateAll do
  let(:project) { create(:project) }
  let(:campaign) { create(:campaign, project: project) }
  let(:threesixty_campaign) { create(:threesixty_campaign, campaign: campaign) }
  let!(:option) { create(:threesixty_option, threesixty_campaign: threesixty_campaign) }
  let!(:first_subject) do
    user = create(:user, project: project, email: 'fedor@gmail.com')
    create(:campaign_user, user: user, campaign: campaign)
    create(:threesixty_subject, user: user, campaign: campaign)
  end
  let!(:relationship) { create(:relationship, name: 'peer', campaign: campaign) }
  let!(:second_subject) do
    user = create(:user, project: project, email: 'ivan@gmail.com')
    create(:campaign_user, user: user, campaign: campaign)
    create(:threesixty_subject, user: user, campaign: campaign)
  end
  let(:params) do
    [
      {
        evaluator_email: 'dev.atanov@gmail.com',
        relationship_name: 'peer', subject: first_subject,
        relationship: relationship, subject_user: first_subject.user, subject_email: 'fedor@gmail.com'
      },
      {
        evaluator_email: 'dev.atanov@gmail.com',
        relationship_name: 'peer', subject: second_subject,
        relationship: relationship, subject_user: second_subject.user, subject_email: 'ivan@gmail.com'
      }
    ]
  end

  subject { described_class.call!(params, threesixty_campaign)[:participants] }

  it '.call' do
    participants = subject

    expect(participants.map { |s| s.evaluator.email }).
      to match_array(%w[dev.atanov@gmail.com dev.atanov@gmail.com])
    expect(participants.map { |s| s.subject.email }).to match_array(%w[ivan@gmail.com fedor@gmail.com])
    expect(participants.map { |s| s.relationship.name }).to match_array(%w[peer peer])
  end

  it 'creates membership for evaluator' do
    subject.each do |participant|
      membership_exits = threesixty_campaign.project.memberships.exists?(user_id: participant.evaluator_id)
      expect(membership_exits).to eq(true)
    end
  end

  it 'stores locale for evaluator user profile' do
    described_class.call!([{
      evaluator_email: 'daniel@cc.com',
      relationship_name: 'peer',
      subject: first_subject,
      subject_email: 'smith@cc.com',
      evaluator_locale: 'en',
      subject_user: first_subject.user,
      relationship: relationship
    }], threesixty_campaign)

    expect(User.last.locale).to eq('en')
  end

  it "doesn't create new evaluator record when it already exists" do
    user = create(:user, project: threesixty_campaign.project, email: 'daniel@cc.com', first_name: 'Daniel')
    create(:threesixty_evaluator, user: user, campaign: threesixty_campaign.campaign)

    expect do
      described_class.call!([{
        evaluator_email: 'daniel@cc.com',
        relationship_name: 'peer',
        subject: first_subject,
        subject_user: first_subject.user,
        subject_email: 'smith@cc.com',
        relationship: relationship
      }], threesixty_campaign)
    end.to_not change(::Threesixty::Evaluator, :count)
  end

  it "doesn't create participants if already exists" do
    user = create(:user, project: threesixty_campaign.project, email: 'daniel@cc.com', first_name: 'Daniel')
    evaluator = create(:threesixty_evaluator, user: user, campaign: threesixty_campaign.campaign)
    create(
      :threesixty_participant,
      subject_id: first_subject.user_id,
      campaign_id:  threesixty_campaign.campaign_id,
      evaluator_id: evaluator.user_id
    )

    expect do
      described_class.call!([{
        evaluator_email: 'daniel@cc.com',
        relationship_name: 'peer',
        subject: first_subject,
        subject_user: first_subject.user,
        subject_email: 'smith@cc.com',
        relationship: relationship
      }], threesixty_campaign)
    end.to_not change(::Threesixty::Participant, :count)
  end

  it 'updates user details if existing used is added as evalautor' do
    user = create(:user,
                  project: threesixty_campaign.project, email: 'daniel@cc.com', first_name: 'Daniel', last_name: 'Col')
    create(:threesixty_evaluator, user: user, campaign: threesixty_campaign.campaign)

    described_class.call!([{
      evaluator_email: 'daniel@cc.com',
      evaluator_first_name: 'John',
      evaluator_last_name: 'Smith',
      relationship_name: 'peer',
      subject: first_subject,
      subject_email: 'caleb@cc.com',
      subject_user: first_subject.user,
      relationship: relationship
    }], threesixty_campaign)

    user.reload

    expect(user.first_name).to eq('John')
    expect(user.last_name).to eq('Smith')
  end

  it 'creates evaluator with password' do
    params = [{
      evaluator_email: 'dev.atanov@gmail.com',
      relationship_name: 'peer', subject: first_subject,
      evaluator_password: 'password@123',
      relationship: relationship, subject_user: first_subject.user, subject_email: 'fedor@gmail.com'
    }]

    participants = described_class.call!(params, threesixty_campaign)[:participants]
    expect(participants.first.evaluator.create_by_invite).to eq(false)
    expect(participants.first.evaluator.valid_password?('password@123')).to eq(true)
  end

  it 'creates evaluator without password' do
    params = [{
      evaluator_email: 'dev.atanov@gmail.com',
      relationship_name: 'peer', subject: first_subject,
      relationship: relationship, subject_user: first_subject.user, subject_email: 'fedor@gmail.com'
    }]

    participants = described_class.call!(params, threesixty_campaign)[:participants]

    expect(participants.first.evaluator.create_by_invite).to eq(true)
    expect(participants.first.evaluator.encrypted_password).to be_blank
  end

  it "doesn't update password of existing user" do
    user = create(:user, project: threesixty_campaign.project,
        email: 'daniel@cc.com', first_name: 'Daniel', last_name: 'Col', password: 'old_password')
    create(:threesixty_evaluator, user: user, campaign: threesixty_campaign.campaign)
    params = [{
      evaluator_email: 'daniel@cc.com',
      relationship_name: 'peer', subject: first_subject,
      evaluator_password: 'new_password',
      relationship: relationship, subject_user: first_subject.user, subject_email: 'fedor@gmail.com'
    }]

    result = described_class.call!(params, threesixty_campaign)
    participants = result[:participants]

    expect(participants.first.evaluator.valid_password?('old_password')).to eq(true)
    expect(result[:existing_evaluators_whose_password_not_changed]).to include(user)
  end
end
