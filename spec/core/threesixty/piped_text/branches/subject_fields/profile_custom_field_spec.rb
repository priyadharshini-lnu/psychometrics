# frozen_string_literal: true

require 'rails_helper'

describe Threesixty::PipedText::Branches::SubjectFields::ProfileCustomField do
  describe '.call' do
    let(:project) { create(:project) }
    let(:campaign) { create(:campaign, project: project) }
    let(:subject) { create(:user, first_name: 'Name', last_name: 'Lastname', email: 'my@email.com', project: project) }
    let(:question1) { create(:question, name: 'Q1') }
    let(:question2) { create(:question, name: 'Q2') }
    let(:question3) { create(:question, name: 'Q3') }

    before do
      project.profile_setting.questions << question1
      project.profile_setting.questions << question2

      custom_fields = {}
      custom_fields[question1.id.to_s] = 'Q1 Value'
      custom_fields[question2.id.to_s] = 'Q2 Value'
      subject.user_profile.update(custom_fields: custom_fields)
    end

    it do
      response = described_class.call!(%w[ProfileCustomField Q1], {}, subject: subject, campaign: campaign)
      expect(response).to eq('Q1 Value')
    end

    it do
      response = described_class.call!(%w[ProfileCustomField Q2], {}, subject: subject, campaign: campaign)
      expect(response).to eq('Q2 Value')
    end

    it do
      response = described_class.call!(%w[ProfileCustomField Random], {}, subject: subject, campaign: campaign)
      expect(response).to eq(nil)
    end

    it do
      response = described_class.call!(%w[ProfileCustomField Q3], {}, subject: subject, campaign: campaign)
      expect(response).to eq(nil)
    end
  end
end
