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
        mobile_number: '+971111111111',
        password: 'asdasd1234',
        schedule_start_date: 1.day.from_now.to_s,
        schedule_end_date: 2.days.from_now.to_s,
        created_at: '11 Jul 2020 / 16:39',
        age: 32,
        gender: 'male',
        profile_locale: 'en',
        custom_field: '1111',
        custom_field2: '1111',
        manager_email: 'namu@gmail.com'
      },
      {
        active: false,
        first_name: 'Vlad',
        last_name: 'Ata',
        email: 'vlad@gmail.com',
        mobile_number: nil,
        password: 'asdfd',
        age: 35,
        created_at: '11 Jul 2020 / 17:25',
        custom_field: '1111',
        manager_email: 'fedor@gmail.com'
      },
      {
        active: nil,
        first_name: 'Namu1234',
        last_name: 'Uki',
        email: 'namu@gmail.com',
        mobile_number: nil,
        password: 'AAA',
        created_at: '11 Jul 2020 / 17:25',
        custom_field: '1111',
        manager_email: nil
      }
    ]
  end

  it "changes password if ovewrite_password is 'Yes'" do
    user = campaign.users.create!(email: 'james@cc.com', password: 'Old_password1')
    import_data = [{
      active: nil,
      first_name: 'James',
      last_name: 'Smith',
      email: 'james@cc.com',
      password: 'New_password1',
      overwrite_password: 'Yes'
    }]

    described_class.call!(
      campaign, current_user, import_data, 'add_with_existing_response', admin_job_record
    )
    expect(user.reload.valid_password?('New_password1')).to eq(true)
  end

  it "doesn't change password if ovewrite_password is not 'Yes'" do
    user = campaign.users.create!(email: 'james@cc.com', password: 'Old_password1')
    import_data = [{
      active: nil,
      first_name: 'James',
      last_name: 'Smith',
      email: 'james@cc.com',
      password: 'New_password1',
      overwrite_password: 'No'
    }]

    described_class.call!(
      campaign, current_user, import_data, 'add_with_existing_response', admin_job_record
    )
    expect(user.reload.valid_password?('New_password1')).to eq(false)
  end

  it 'saves error if update fails' do
    user = campaign.users.create!(email: 'james@cc.com', password: 'Old_password1')
    import_data = [{
      active: nil,
      first_name: 'James',
      last_name: 'Smith',
      email: 'james@cc.com',
      password: 'Weak_password',
      overwrite_password: 'Yes'
    }]

    described_class.call!(
      campaign, current_user, import_data, 'add_with_existing_response', admin_job_record
    )
    expect(user.reload.valid_password?('weak_password')).to eq(false)
    expect(admin_job_record.error_messages).to eq(
      ["User update failed for james@cc.com with error 'Password must contain at least one digit'"]
    )
  end

  it '.call' do
    campaign.users.create!(email: 'vlad@gmail.com', password: 'A!sdasd129431')
    campaign.users.create!(email: 'namu@gmail.com', password: 'A!namkhf129457')

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
    expect(fedor_user).to have_attributes(mobile_number: '+971111111111')
    expect(fedor_user).to have_attributes(mobile_verified: false)
    expect(fedor_user.user_profile).to have_attributes(age: 32)
    expect(fedor_user.user_profile).to have_attributes(gender: 'male', profile_locale: 'en')
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

  it '.call - all new users' do
    _, imported_users = described_class.call!(
      campaign, current_user, import_data, 'add_with_existing_response', admin_job_record
    )

    vlad_user = campaign.users.find_by(email: 'vlad@gmail.com')
    vlad_campaign_user = campaign.campaign_users.find_by(user_id: vlad_user.id)

    nam_user = campaign.users.find_by(email: 'namu@gmail.com')
    nam_campaign_user = campaign.campaign_users.find_by(user_id: nam_user.id)

    fedor_user = campaign.users.find_by(email: 'fedor@gmail.com')
    fedor_campaign_user = campaign.campaign_users.find_by(user_id: fedor_user.id)

    expect(imported_users.size).to eq(3)

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
      campaign.users.create!(email: 'vlad@gmail.com', password: 'A!sdasd129431')
      campaign.users.create!(email: 'namu@gmail.com', password: 'A!namkhf129450')

      _data, imported_users = described_class.call!(
        campaign, current_user, import_data, 'add_with_existing_response', admin_job_record
      )
      fedor_user = campaign.users.find_by(email: 'fedor@gmail.com')
      vlad_user = campaign.users.find_by(email: 'vlad@gmail.com')

      expect(imported_users.size).to eq(3)
      expect(fedor_user).to have_attributes(first_name: 'Fedor', last_name: 'Tar')
      expect(fedor_user.user_profile).to have_attributes(age: 32)
      expect(fedor_user.user_profile).to have_attributes(custom_fields: { question.id => '1111' })
      expect(vlad_user.user_profile).to have_attributes(age: 35)
    end
  end

  describe 'with manager emails' do
    it 'create new users with manager id' do
      _data, imported_users = described_class.call!(
        campaign, current_user, import_data, 'add_with_existing_response', admin_job_record
      )
      fedor_user = campaign.users.find_by(email: 'fedor@gmail.com')
      vlad_user = campaign.users.find_by(email: 'vlad@gmail.com')
      namu_user = campaign.users.find_by(email: 'namu@gmail.com')

      expect(imported_users.size).to eq(3)
      expect(fedor_user.manager_email).to eq('namu@gmail.com')
      expect(vlad_user.manager_email).to eq('fedor@gmail.com')
      expect(namu_user.manager_email).to eq(nil)
    end

    it 'update users with manager id' do
      campaign.users.create!(email: 'fedor@gmail.com', password: 'A!sdasd129431')

      described_class.call!(
        campaign, current_user, import_data, 'add_with_existing_response', admin_job_record
      )

      fedor_user = campaign.users.find_by(email: 'fedor@gmail.com')

      expect(fedor_user.manager_email).to eq('namu@gmail.com')
    end
  end

  describe 'with existing user' do
    it 'sets mobile verified false if mobile number is changed' do
      campaign.users.create!(email: 'fedor@gmail.com', password: 'A!sdasd129431', mobile_number: '+971111111110',
                             mobile_verified: true)

      described_class.call!(
        campaign, current_user, import_data, 'add_with_existing_response', admin_job_record
      )

      fedor_user = campaign.users.find_by(email: 'fedor@gmail.com')
      expect(fedor_user).to have_attributes(mobile_number: '+971111111111')
      expect(fedor_user).to have_attributes(mobile_verified: false)
    end

    it 'keeps mobile verified true if mobile number is not changed' do
      campaign.users.create!(email: 'fedor@gmail.com', password: 'A!sdasd129431', mobile_number: '+971111111111',
                             mobile_verified: true)

      described_class.call!(
        campaign, current_user, import_data, 'add_with_existing_response', admin_job_record
      )

      fedor_user = campaign.users.find_by(email: 'fedor@gmail.com')
      expect(fedor_user).to have_attributes(mobile_number: '+971111111111')
      expect(fedor_user).to have_attributes(mobile_verified: true)
    end
  end

  describe 'chunked processing' do
    let(:strong_password) { 'A!newpass123' }

    it 'processes records across chunk boundaries' do
      chunked_rows = (1..501).map do |i|
        {
          active: true,
          first_name: "User#{i}",
          last_name: 'Chunk',
          email: "chunk_user_#{i}@example.com",
          mobile_number: nil,
          password: strong_password,
          created_at: '11 Jul 2020 / 17:25',
          manager_email: nil
        }
      end

      _data, imported_users = described_class.call!(
        campaign, current_user, chunked_rows, 'add_with_existing_response', admin_job_record
      )

      expect(imported_users.size).to eq(501)
      expect(campaign.users.find_by(email: 'chunk_user_500@example.com')).to be_present
      expect(campaign.users.find_by(email: 'chunk_user_501@example.com')).to be_present
      expect(admin_job_record.reload.completed_tasks).to eq(501)
    end
  end
end
