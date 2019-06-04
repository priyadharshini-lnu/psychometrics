# frozen_string_literal: true

require 'rails_helper'

describe Threesixty::Subjects::CreateAll do
  let(:project) { create(:project) }
  let(:campaign) { create(:campaign, project: project) }
  let(:threesixty_campaign) { create(:threesixty_campaign, campaign: campaign) }
  before do
    user = create(:user, project: project, email: 'fedor@gmail.com')
    create(:campaigns_user, user: user, campaign: campaign)
    create(:threesixty_subject, user: user, campaign: campaign)
    create(:relationship, name: 'Self')
  end
  describe '.call' do
    it do
      subjects = described_class.call!({ "0": { email: 'dev.atanov@gmail.com' }, "1": { email: 'fedor@gmail.com' } }, threesixty_campaign)
      participants = Participant.all
      expect(subjects.map { |s| s.user.email }).to match_array(%w[fedor@gmail.com dev.atanov@gmail.com])
      expect(participants.map { |s| s.evaluator.email }).to match_array(%w[fedor@gmail.com dev.atanov@gmail.com])
      expect(participants.map { |s| s.subject.email }).to match_array(%w[fedor@gmail.com dev.atanov@gmail.com])
    end
  end
end
