# frozen_string_literal: true

require 'rails_helper'

describe Threesixty::Subjects::Remove do
  let(:campaign) { create(:campaign) }
  let(:threesixty_campaign) { create(:threesixty_campaign, campaign: campaign) }
  let(:subject) { create(:threesixty_subject, campaign: campaign) }

  it 'deletes users_report' do
    user_report = create(:users_report, user_id: subject.user_id, campaign_id: campaign.id)
    Threesixty::Subjects::Remove.call(subject, threesixty_campaign)

    expect(UsersReport.find_by(id: user_report.id)).to be_nil
  end

  it 'delete evaluation_results' do
    users_result = create(:users_result, subject_id: subject.user_id)
    Threesixty::Subjects::Remove.call(subject, threesixty_campaign)

    expect(UsersResult.find_by(id: users_result.id)).to be_nil
  end

  it "removes subject's participant" do
    participant = create(:threesixty_participant, subject: subject.user, campaign: campaign)
    Threesixty::Subjects::Remove.call(subject, threesixty_campaign)

    expect(Threesixty::Participant.find_by(id: participant.id)).to be_nil
  end

  it 'deletes subject' do
    Threesixty::Subjects::Remove.call(subject, threesixty_campaign)

    expect(Threesixty::Subject.find_by(id: subject.id)).to be_nil
  end
end
