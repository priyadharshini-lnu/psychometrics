# frozen_string_literal: true

require 'rails_helper'

describe Users::Registration::WithRegistrationCodeForm do
  let(:project) { create(:project) }
  let(:valid_attrs) do
    {
      first_name: 'James',
      last_name: 'Smith',
      email: "#{Faker::Internet.user_name}@cc.com",
      registration_code: 'abc'
    }
  end

  it 'validates if registration_code is provided' do
    form = described_class.new(valid_attrs.merge(registration_code: '')).with_context(project: project)

    expect(form.valid?).to eq(false)
    expect(form.errors.messages[:registration_code]).to include("can't be blank")
  end

  it 'validates if provided registration_code exits in a database' do
    form = described_class.new(valid_attrs.merge(registration_code: 'xyz')).with_context(project: project)

    expect(form.valid?).to eq(false)
    expect(form.errors.messages[:registration_code]).to include('Registration code is invalid')
  end

  it 'only allows email from the restricted_domains' do
    create(:registration_code, project: project, code: 'abc', start_date: 1.day.ago, end_date: 2.days.from_now,
    restricted_domains: ['abc.com'])
    form = described_class.new(valid_attrs.merge(registration_code: 'abc')).with_context(project: project)

    expect(form.valid?).to eq(false)
  end

  it 'valid? returns true if passed registration_code exsits in the database' do
    reg_code = create(
      :registration_code, project: project, campaign: create(:campaign), code: 'abc',
      start_date: 1.day.ago, end_date: 2.days.from_now
    )
    create(
      :communication, kind: :invitation, recipients: :new_users, project_campaign: reg_code.campaign
    )
    form = described_class.new(valid_attrs.merge(registration_code: 'abc')).with_context(project: project)

    expect(form.valid?).to eq(true)
  end
end
