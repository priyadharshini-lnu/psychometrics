# frozen_string_literal: true

require 'rails_helper'

describe Threesixty::Emails::ScheduleApprovalNominationEmail do
  let(:options) do
    create(:threesixty_option, participants: {
      manager: {
        can_approve_nominations: true,
        email_managers_on_nomination_approval: true
      },
      subject: { can_nominate_evaluators: true }
    })
  end
  let(:threesixty_campaign) { create(:threesixty_campaign, option: options) }
  let(:threesixty_subject) do
    create(:threesixty_subject, campaign: threesixty_campaign.campaign)
  end

  let(:evaluator2) { create(:user) }
  let(:evaluator) { create(:threesixty_evaluator, campaign: threesixty_campaign.campaign) }
  let(:manager_evaluator) { create(:threesixty_evaluator, campaign: threesixty_campaign.campaign) }

  let(:template) do
    create(:threesixty_email_template, threesixty_campaign: threesixty_campaign,
      name: 'approve_nomination', daily_digest: true, schedule_time: '2018-09-15 19:22:00.000000000 +0400')
  end

  before do
    create(:threesixty_participant, :with_relationship, campaign: threesixty_campaign.campaign,
      subject_id: threesixty_subject.user_id, evaluator_id: evaluator2.id)

    create(:user_assessment, campaign: threesixty_campaign.campaign, subject_id: threesixty_subject.user_id,
      evaluator_id: manager_evaluator.user_id)

    create(:threesixty_participant, :with_relationship, campaign: threesixty_campaign.campaign,
      subject_id: threesixty_subject.user_id, evaluator_id: manager_evaluator.user_id)
  end

  it 'create email_schedules at specific time' do
    described_class.call!(threesixty_campaign, template, threesixty_subject, evaluator)
    described_class.call!(threesixty_campaign, template, threesixty_subject, evaluator)
    described_class.call!(threesixty_campaign, template, threesixty_subject, evaluator)
    scheduled_email = Threesixty::EmailSchedule.last
    expect(scheduled_email.scheduled_date.utc).to eq('2018-09-15 15:22:59.000000000 +0000')
    expect(Threesixty::EmailSchedule.count).to eq(1)
  end

  it 'create email_schedules without default time' do
    template.schedule_time = nil

    described_class.call!(threesixty_campaign, template, threesixty_subject, evaluator)
    scheduled_email = Threesixty::EmailSchedule.last
    expect(scheduled_email.scheduled_date.utc).to eq('2018-09-15 16:00:59.000000000 +0000')
  end

  it 'schedule email on next day' do
    template.schedule_time = '2018-09-15 9:00:00.000000000 +0000'

    described_class.call!(threesixty_campaign, template, threesixty_subject, evaluator)
    scheduled_email = Threesixty::EmailSchedule.last
    expect(scheduled_email.scheduled_date.utc).to eq('2018-09-16 5:00:59.000000000 +0000')
  end
end
