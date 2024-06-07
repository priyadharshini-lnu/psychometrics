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

  context 'require_mobile_number is true in registration_setting' do
    let(:valid_attrs) do
      {
        first_name: 'James',
        last_name: 'Smith',
        email: "#{Faker::Internet.user_name}@cc.com",
        registration_code: 'abc',
        mobile_number: '+911234567890',
        mobile_verification_token: mobile_verification_token('+911234567890')
      }
    end

    let!(:reg_code) do
      create(
        :registration_code, project: project, campaign: create(:campaign), code: 'abc',
      start_date: 1.day.ago, end_date: 2.days.from_now
      )
    end

    let!(:communication) do
      create(
        :communication, kind: :invitation, recipients: :new_users, project_campaign: reg_code.campaign
      )
    end

    before(:each) do
      project.registration_setting.update(require_mobile_number: true)
    end

    it 'raise error when mobile number is empty' do
      form = described_class.new(valid_attrs.merge(mobile_number: '')).with_context(project: project)

      expect(form.valid?).to eq(false)

      expect(form.errors[:mobile_number]).to include(
        I18n.t('activemodel.errors.models.register.attributes.mobile_number.blank')
      )
    end

    it 'raise error when mobile number not mathching with validation token' do
      form = described_class.new(
        valid_attrs.merge(mobile_verification_token: mobile_verification_token('911234567890'))
      ).with_context(project: project)

      expect(form.valid?).to eq(false)

      expect(form.errors[:mobile_number]).to include(
        I18n.t('activemodel.errors.models.register.attributes.mobile_number.invalid')
      )
    end

    private

    def mobile_verification_token(mobile_number)
      JWT.encode({ data: mobile_number }, Rails.application.secrets.encrypted_key)
    end
  end
end
