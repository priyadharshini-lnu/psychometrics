# frozen_string_literal: true

require 'rails_helper'

describe UserReports::GeneratePdf do
  let(:user) { create(:user, :with_project_membership) }
  let(:user_report) { create(:user_report, user: user) }
  let(:report) { user_report.report }
  let(:current_user) { create(:superadmin) }

  it 'create report pdf in tmp location where current_user is a super admin' do
    output_path = described_class.call!(user_report, current_user)

    # rubocop:disable Layout/LineLength
    expect(output_path).to include(
      "tmp/reports/#{user.email}/#{user.email}_#{report.decorate.display_name.parameterize}_#{Date.today.strftime('%F')}.pdf"
    )
    # rubocop:enable Layout/LineLength
  end

  it 'create report pdf in tmp location where current_user is a regular user' do
    output_path = described_class.call!(user_report, user)

    # rubocop:disable Layout/LineLength
    expect(output_path).to include(
      "tmp/reports/#{user.email}/#{user.email}_#{report.decorate.display_name.parameterize}_#{Date.today.strftime('%F')}.pdf"
    )
    # rubocop:enable Layout/LineLength
  end
end
