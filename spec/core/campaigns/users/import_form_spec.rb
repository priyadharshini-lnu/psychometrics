# frozen_string_literal: true

require 'rails_helper'

describe Campaigns::Users::ImportForm do
  let(:campaign) { create(:campaign) }
  let!(:manager) {  campaign.users.create!(email: 'james@cc.com', password: 'Password@168') }

  let(:valid_attrs) do
    {
      active: true,
      first_name: 'Vlad',
      last_name: 'Ata',
      email: 'vlad@gmail.com',
      password: nil,
      manager_email: 'james@cc.com',
      schedule_start_date: 1.day.from_now.to_s,
      schedule_end_date: 2.days.from_now.to_s,
      created_at: '11 Jul 2020 / 17:25'
    }
  end
  let(:user) { create(:user) }

  let(:options) do
    { import_data: [
      UserDecorator.export_headers,
      valid_attrs
    ], operation: 'add_and_allow_new_response' }
  end

  let(:user_attributes) { attrs.except(:operation, :schedule_start_date, :schedule_end_date) }

  it 'validates dates are in proper format' do
    options = { import_data: [
      UserDecorator.export_headers,
      valid_attrs.merge(schedule_start_date: 'invalid_date', schedule_end_date: '30-30-10')
    ], operation: 'add_and_allow_new_response' }
    form = described_class.new(options).with_context(campaign: campaign, current_user: user)

    expect(form.valid?).to eq(false)
    expect(form.errors.full_messages).to include(
      'Import data Row 1: Schedule start date is invalid, Schedule end date is invalid'
    )
  end

  it 'validates presence of proper operation' do
    form = described_class.new(options.merge(operation: 'wrong')).with_context(campaign: campaign, current_user: user)

    expect(form.valid?).to eq(false)
    expect(form.errors[:operation]).to include('is not included in the list')
  end

  it 'validates header' do
    form = described_class.new(options.merge(import_data: [%w[A B]])).with_context(campaign: campaign,
                                                                                   current_user: user)

    expect(form.valid?).to eq(false)
    expect(form.errors[:import_data]).to include('Invalid header, take header from export')
  end

  it 'passes when a few users to be updated' do
    campaign.users.create(email: 'vlad@gmail.com', password: 'asdasd')
    form = described_class.new(options).with_context(campaign: campaign, current_user: user)
    expect(form.valid?).to eq(true)
  end

  it 'passes all validations' do
    form = described_class.new(options).with_context(campaign: campaign, current_user: user)
    expect(form.valid?).to eq(true)
  end

  it 'validates UAT column values' do
    form = described_class.new(
      options.merge(import_data: [UserDecorator.export_headers, valid_attrs.merge(is_uat: 'Maybe')])
    ).with_context(campaign: campaign, current_user: user)

    expect(form.valid?).to eq(false)
    expect(form.errors.full_messages).to include('Import data Row 1: UAT must be Yes, No, or blank')
  end

  describe 'validate_manager_emails' do
    let(:existing_email) { 'james@cc.com' }
    let(:non_existing_email) { 'non_existing@cc.com' }
    let(:invalid_email) { 'invalid_email' }

    it 'adds an error if the manager email does not exist in the database or the import data' do
      options = { import_data: [
        UserDecorator.export_headers,
        valid_attrs.merge(manager_email: non_existing_email)
      ], operation: 'add_and_allow_new_response' }

      form = described_class.new(options).with_context(campaign: campaign, current_user: user)

      expect(form.valid?).to eq(false)
      expect(form.errors.full_messages).to include(
        'Import data Row 1: Manager with email non_existing@cc.com is not present in the campaign or in CSV'
      )
    end

    it 'does not add an error if the manager email exists in the database' do
      options = { import_data: [
        UserDecorator.export_headers,
        valid_attrs.merge(manager_email: existing_email)
      ], operation: 'add_and_allow_new_response' }

      form = described_class.new(options).with_context(campaign: campaign, current_user: user)

      expect(form.valid?).to eq(true)
    end

    it 'does not add an error if the manager email does not exist in the database but exists in the import data' do
      new_manager_email = 'new_manager@cc.com'
      options = { import_data: [
        UserDecorator.export_headers,
        valid_attrs.merge(manager_email: new_manager_email),
        valid_attrs.merge(email: new_manager_email)
      ], operation: 'add_and_allow_new_response' }

      form = described_class.new(options).with_context(campaign: campaign, current_user: user)

      expect(form.valid?).to eq(true)
    end

    it 'adds an error if the manager email format is invalid' do
      options = { import_data: [
        UserDecorator.export_headers,
        valid_attrs.merge(manager_email: invalid_email)
      ], operation: 'add_and_allow_new_response' }

      form = described_class.new(options).with_context(campaign: campaign, current_user: user)

      expect(form.valid?).to eq(false)
      expect(form.errors.full_messages).to include(
        "Import data Row 1: Invalid email #{invalid_email}"
      )
    end
  end

  describe 'validate_available_licenses' do
    let(:form) { described_class.new(options).with_context(campaign: campaign, current_user: user) }

    before do
      create(:campaign_report, campaign: campaign, auto_assign: true)
    end

    it 'adds an error when available licenses are less than new users count' do
      License.where(client_id: campaign.client_id).update_all('used_number = number + overuse_number')

      expect(form.valid?).to eq(false)
      expect(form.errors.details[:import_data]).to include(
        hash_including(error: :not_enough_licenses, required_count: 1, available_count: 0)
      )
    end

    it 'skips license consumption requirement for UAT users' do
      License.where(client_id: campaign.client_id).update_all('used_number = number + overuse_number')
      uat_options = {
        import_data: [UserDecorator.export_headers, valid_attrs.merge(is_uat: 'Yes')],
        operation: 'add_and_allow_new_response'
      }
      uat_form = described_class.new(uat_options).with_context(campaign: campaign, current_user: user)

      expect(uat_form.valid?).to eq(true)
    end

    it 'passes when enough licenses are available' do
      create(:license, client: campaign.client, number: 1, used_number: 0, overuse_number: 0)

      expect(form.valid?).to eq(true)
    end

    it 'skips license validation when operation is skip_existing' do
      options[:operation] = 'skip_existing'

      expect(form.valid?).to eq(true)
    end

    it 'skips license validation when no auto assign report exists' do
      campaign.campaign_reports.update_all(auto_assign: false)

      expect(form.valid?).to eq(true)
    end
  end
end
