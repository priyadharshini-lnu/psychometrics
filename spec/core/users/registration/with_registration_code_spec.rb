# frozen_string_literal: true

require 'rails_helper'

describe Users::Registration::WithRegistrationCode do
  let(:campaign) { create(:campaign) }
  let(:project) { campaign.project }
  let!(:registration_code) do
    create(:registration_code, campaign: campaign, project: project, use_count: 0, code: 'abc')
  end
  let(:report) { create(:report) }
  let(:report_family) { report.report_families.last }

  let!(:campaign_reports) do
    create_list(:campaign_report, 1, report: report, campaign: campaign, report_family: report_family)
  end

  let!(:license) do
    create(
      :license,
      report_family: report_family,
      client: campaign.client,
      start_date: 2.days.ago,
      end_date: 2.days.since
    )
  end

  let(:form) do
    Users::Registration::WithRegistrationCodeForm.new({
      first_name: 'James',
      last_name: 'Smith',
      email: Faker::Internet.email,
      registration_code: 'abc',
      mobile_number: '+911234567890',
      mobile_verified: true
    })
  end

  it 'creates user and adds it to appropriate campaign' do
    described_class.call!(form, project)
    user = User.find_by(email: form.email)

    expect(user).to_not eq(nil)
    expect(user.first_name).to eq(form.first_name)
    expect(user.last_name).to eq(form.last_name)
    expect(user.campaigns.exists?(id: campaign.id)).to eq(true)
    expect(user.mobile_number).to eq(form.mobile_number)
    expect(user.mobile_verified).to eq(form.mobile_verified)
  end

  it 'increments registration_code use_count' do
    described_class.call!(form, project)

    expect(registration_code.reload.use_count).to eq(1)
  end

  it 'rails Not Enough  Licenses Error if enough_license_credits are avaliable' do
    license.update!(number: 10, overuse_number: 0, used_number: 10)

    expect { described_class.call!(form, project) }.to broadcast(:error)
    expect(form.errors.full_messages).to include(match(/LicenseError/))
  end
end
