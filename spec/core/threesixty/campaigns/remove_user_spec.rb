# frozen_string_literal: true

require 'rails_helper'

describe Threesixty::Campaigns::RemoveUser do
  let(:campaign) { create(:campaign) }
  let(:threesixty_campaign) { create(:threesixty_campaign, campaign: campaign) }
  let(:subject) { create(:threesixty_subject, campaign: campaign) }
  let(:user) { subject.user }

  it 'deletes users_report' do
    user_report = create(:users_report, user_id: user.id, campaign_id: campaign.id)
    Threesixty::Campaigns::RemoveUser.call(user, threesixty_campaign)

    expect(UsersReport.find_by(id: user_report.id)).to be_nil
  end

  it 'deletes evaluation_results' do
    users_result = create(:users_result, subject_id: user.id, campaign_id: campaign.id)
    Threesixty::Campaigns::RemoveUser.call(user, threesixty_campaign)

    expect(UsersResult.find_by(id: users_result.id)).to be_nil
  end

  it 'deletes evaluated_results' do
    users_result = create(:users_result, evaluator_id: user.id, campaign_id: campaign.id)
    Threesixty::Campaigns::RemoveUser.call(user, threesixty_campaign)

    expect(UsersResult.find_by(id: users_result.id)).to be_nil
  end

  it 'deletes campaign_user' do
    campaigns_user = create(:campaigns_user, user_id: user.id, campaign_id: campaign.id)
    Threesixty::Campaigns::RemoveUser.call(user, threesixty_campaign)

    expect(CampaignsUser.find_by(id: campaigns_user.id)).to be_nil
  end

  it 'deletes subject record for the user' do
    Threesixty::Campaigns::RemoveUser.call(user, threesixty_campaign)

    expect(Threesixty::Subject.find_by(id: subject.id)).to be_nil
  end

  it 'deletes evaluation record fot the user' do
    evaluator = create(:threesixty_evaluator, campaign: campaign, user_id: user.id)
    Threesixty::Campaigns::RemoveUser.call(user, threesixty_campaign)

    expect(Threesixty::Evaluator.find_by(id: evaluator.id)).to be_nil
  end

  it 'deletes participant record where user is a subject' do
    evaluator = create(:threesixty_evaluator, campaign: campaign)
    participant = create(:threesixty_participant, subject: user, evaluator: evaluator.user, campaign: campaign)
    Threesixty::Campaigns::RemoveUser.call(user, threesixty_campaign)

    expect(Threesixty::Participant.find_by(id: participant.id)).to be_nil
  end

  it 'deletes participant record where user is a evaluator' do
    evaluator = create(:threesixty_evaluator, campaign: campaign)
    participant = create(:threesixty_participant, subject: user, evaluator: evaluator.user, campaign: campaign)
    Threesixty::Campaigns::RemoveUser.call(evaluator.user, threesixty_campaign)

    expect(Threesixty::Participant.find_by(id: participant.id)).to be_nil
  end
end
