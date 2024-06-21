# frozen_string_literal: true

require 'rails_helper'

describe Users::Registration::WithRegistrationCode do
  let(:campaign) { create(:campaign) }
  let(:project) { campaign.project }
  let!(:registration_code) do
    create(:registration_code, campaign: campaign, project: project, use_count: 0, code: 'abc')
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
end
