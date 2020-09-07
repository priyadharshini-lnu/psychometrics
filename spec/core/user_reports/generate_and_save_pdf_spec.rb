# frozen_string_literal: true

require 'rails_helper'

describe UserReports::GenerateAndSavePdf do
  let(:user) { create(:user, email: 'samdad@cc.com') }
  let(:user_report) { create(:user_report, user: user) }
  let(:report) { user_report.report }
  let(:current_user) { create(:superadmin) }

  it 'save pdf in user_report' do
    expect(UserReports::GeneratePdf).to receive(:call!).and_return('spec/fixtures/files/reports/test.pdf')

    described_class.call!(user_report, current_user)

    expect(user_report.pdf.url).to be_present
    expect(user_report.read_attribute(:pdf)).to eq('test.pdf')
  end
end
