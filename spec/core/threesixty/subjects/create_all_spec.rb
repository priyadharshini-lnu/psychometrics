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
  end

  describe '.call' do
    it 'duplicated emails' do
      result = described_class.call!([{ email: 'dev.atanov@gmail.com' }, { email: 'fedor@gmail.com' }], threesixty_campaign)
      expect(result[:subjects].map { |s| s.user.email }).to match_array(%w[fedor@gmail.com dev.atanov@gmail.com])
    end
  end
end
