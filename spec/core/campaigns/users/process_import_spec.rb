# frozen_string_literal: true

require 'rails_helper'

describe Campaigns::Users::ProcessImport do
  let!(:campaign) { create(:campaign) }
  let!(:current_user) { create(:user) }
  let(:admin_job_record) { create(:admin_job_record) }
  let(:import_data) do
    [
      {
        active: true,
        first_name: 'Fedor',
        last_name: 'Tar',
        email: 'fedor@gmail.com',
        password: 'asdasd1234',
        schedule_start_date: 1.day.from_now.to_s,
        schedule_end_date: 2.days.from_now.to_s,
        created_at: '11 Jul 2020 / 16:39',
        age: 32,
        custom_field: '1111',
        custom_field2: '1111'
      },
      {
        active: false,
        first_name: 'Vlad',
        last_name: 'Ata',
        email: 'vlad@gmail.com',
        password: 'asdfd',
        age: 35,
        created_at: '11 Jul 2020 / 17:25',
        custom_field: '1111'
      },
      {
        active: nil,
        first_name: 'Namu1234',
        last_name: 'Uki',
        email: 'namu@gmail.com',
        password: 'AAA',
        created_at: '11 Jul 2020 / 17:25',
        custom_field: '1111'
      }
    ]
  end

  it '.call' do
    campaign.users.create!(email: 'vlad@gmail.com', password: 'A!sdasd1234321')
    campaign.users.create!(email: 'namu@gmail.com', password: 'A!namkhf123456')

    data, imported_users = described_class.call!(
      campaign, current_user, import_data, 'add_with_existing_response', admin_job_record
    )

    vlad_user = campaign.users.find_by(email: 'vlad@gmail.com')
    vlad_campaign_user = campaign.campaign_users.find_by(user_id: vlad_user.id)

    nam_user = campaign.users.find_by(email: 'namu@gmail.com')
    nam_campaign_user = campaign.campaign_users.find_by(user_id: nam_user.id)

    fedor_user = campaign.users.find_by(email: 'fedor@gmail.com')
    fedor_campaign_user = campaign.campaign_users.find_by(user_id: fedor_user.id)

    expect(imported_users.size).to eq(3)
    expect(fedor_user).to have_attributes(first_name: 'Fedor', last_name: 'Tar')
    expect(fedor_user).to have_attributes(first_name: 'Fedor', last_name: 'Tar')
    expect(fedor_user.user_profile).to have_attributes(age: 32)
    expect(fedor_user.user_profile).to have_attributes(custom_fields: {})
    expect(fedor_campaign_user.schedule_start_date).to eq(1.day.from_now)
    expect(fedor_campaign_user.schedule_end_date).to eq(2.days.from_now)

    expect(
      [
        { email: vlad_user.email, first_name: vlad_user.first_name, last_name: vlad_user.last_name },
        { email: nam_user.email, first_name: nam_user.first_name, last_name: nam_user.last_name }
      ]
    ).to eq(data)
    expect(vlad_campaign_user.active).to be_falsey
    expect(fedor_campaign_user.active).to be_truthy
    expect(nam_campaign_user.active).to be_truthy
  end

  describe 'with custom fields' do
    let!(:question) do
      create(:question, name: 'custom_field')
    end
    let!(:profile_field) do
      create(:profile_field, required: true, profile_setting: campaign.project.profile_setting, question: question)
    end

    it do
      campaign.users.create!(email: 'vlad@gmail.com', password: 'A!sdasd1234321')
      campaign.users.create!(email: 'namu@gmail.com', password: 'A!namkhf123456')

      _data, imported_users = described_class.call!(
        campaign, current_user, import_data, 'add_with_existing_response', admin_job_record
      )
      fedor_user = campaign.users.find_by(email: 'fedor@gmail.com')
      vlad_user = campaign.users.find_by(email: 'vlad@gmail.com')

      expect(imported_users.size).to eq(3)
      expect(fedor_user).to have_attributes(first_name: 'Fedor', last_name: 'Tar')
      expect(fedor_user.user_profile).to have_attributes(age: 32)
      expect(fedor_user.user_profile).to have_attributes(custom_fields: { 'custom_field' => '1111' })
      expect(vlad_user.user_profile).to have_attributes(age: 35)
    end
  end
end
