# frozen_string_literal: true

require 'rails_helper'

describe Threesixty::Subjects::Remove do
  let(:tenancy) { create(:tenancy) }
  let(:campaign) { create(:campaign, project: tenancy) }
  let(:threesixty_campaign) { create(:threesixty_campaign, campaign: campaign) }
  let(:subject) { create(:threesixty_subject, campaign: campaign) }
  let(:super_admin) { create(:superadmin) }

  it 'deletes users_report' do
    user_report = create(:users_report, user_id: subject.user_id, campaign_id: campaign.id)
    Threesixty::Subjects::Remove.call!(threesixty_campaign: threesixty_campaign, subject: subject)

    expect(UsersReport.find_by(id: user_report.id)).to be_nil
  end

  it 'delete evaluation_results' do
    users_result = create(:users_result, subject_id: subject.user_id)
    Threesixty::Subjects::Remove.call!(threesixty_campaign: threesixty_campaign, subject: subject)

    expect(UsersResult.find_by(id: users_result.id)).to be_nil
  end

  it "removes subject's participant" do
    participant = create(:threesixty_participant, subject: subject.user, campaign: campaign)
    Threesixty::Subjects::Remove.call!(threesixty_campaign: threesixty_campaign, subject: subject)

    expect(Threesixty::Participant.find_by(id: participant.id)).to be_nil
  end

  it 'deletes subject' do
    Threesixty::Subjects::Remove.call!(threesixty_campaign: threesixty_campaign, subject: subject)

    expect(Threesixty::Subject.find_by(id: subject.id)).to be_nil
  end

  it 'deletes subject and marks license_usage as inactive' do
    create(:threesixty_license, client: tenancy)
    create(:license_usage, client: tenancy,
      license: tenancy.licenses.find_by(type: 'threesixty'),
      user: subject.user, campaign: campaign)
    Threesixty::Subjects::Remove.call!(
      threesixty_campaign: threesixty_campaign,
      subject: subject,
      updater_id: super_admin.id,
      remove_license_usage: true
    )
    expect(Threesixty::Subject.find_by(id: subject.id)).to be_nil
    expect(LicenseUsage.find_by(user_id: subject.user_id, campaign: campaign).inactive?).to be_truthy
  end
end
