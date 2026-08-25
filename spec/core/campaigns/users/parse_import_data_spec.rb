# frozen_string_literal: true

require 'rails_helper'

describe Campaigns::Users::ParseImportData do
  let!(:campaign) { create(:campaign) }
  let!(:question) do
    create(:question, { name: 'custom_field' })
  end
  let!(:profile_field) do
    create(:profile_field, required: true, profile_setting: campaign.project.profile_setting, question: question)
  end

  it '.call' do
    file = Rack::Test::UploadedFile.new(Rails.root.join('spec/fixtures/files/users_export.csv'), 'text/csv')
    data = described_class.call!(file, campaign)

    expect(data).to eq([
      ['Active', 'UAT', 'First Name', 'Last Name', 'Email Address', 'Mobile number', 'Password',
       'Overwrite password', 'Schedule start date', 'Schedule end date', 'Created Date', 'Manager email',
       'Current job role', 'Target job role', 'Level', 'Age', 'Gender', 'ProfileLocale',
       'Custom Field1', 'Custom Field2'],
      {
        active: true,
        is_uat: 'No',
        first_name: 'Fedor',
        last_name: 'Tar',
        email: 'fedor@gmail.com',
        mobile_number: '+971111111111',
        password: nil,
        overwrite_password: nil,
        schedule_start_date: '14 Jul 2020 10:30 +04:00',
        schedule_end_date: '14 Jul 2020 11:30 +04:00',
        current_job_role: 'Developer',
        target_job_role: 'Senior dev',
        level: 'apply',
        age: '5',
        gender: nil,
        profile_locale: nil,
        created_at: '11 Jul 2020 / 16:39',
        manager_email: 'shuja@gmail.com',
        custom_field: 'c1'
      },
      {
        active: true,
        is_uat: 'No',
        first_name: 'Vlad',
        last_name: 'Ata',
        email: 'vlad@gmail.com',
        mobile_number: nil,
        password: nil,
        overwrite_password: nil,
        schedule_start_date: nil,
        schedule_end_date: nil,
        created_at: '11 Jul 2020 / 17:25',
        manager_email: 'shuja@gmail.com',
        current_job_role: 'Developer',
        target_job_role: 'Senior dev',
        level: nil,
        age: '10',
        gender: nil,
        profile_locale: nil,
        custom_field: 'c1'
      },
      {
        active: true,
        is_uat: 'No',
        first_name: 'Rohan',
        last_name: 'R',
        email: 'rohan@gmail.com',
        mobile_number: nil,
        password: nil,
        overwrite_password: nil,
        schedule_start_date: nil,
        schedule_end_date: nil,
        created_at: '22 Jul 2020 / 18:40',
        manager_email: 'shuja@gmail.com',
        current_job_role: 'Developer',
        target_job_role: 'Senior dev',
        level: nil,
        age: '20',
        gender: nil,
        profile_locale: nil,
        custom_field: 'c1'
      },
      {
        active: true,
        is_uat: 'No',
        first_name: 'Shuja',
        last_name: 'S',
        email: 'shuja@gmail.com',
        mobile_number: nil,
        password: nil,
        overwrite_password: nil,
        schedule_start_date: nil,
        schedule_end_date: nil,
        created_at: '22 Jul 2020 / 19:03',
        manager_email: nil,
        current_job_role: nil,
        target_job_role: nil,
        level: nil,
        age: '30',
        gender: nil,
        profile_locale: nil,
        custom_field: 'c1'
      }
    ])
  end

  it 'leaves the raw UAT value untouched so validation can inspect it' do
    data = described_class.call!([
      ['Active', 'UAT', 'First Name', 'Last Name', 'Email Address'],
      ['Yes', 'Yes', 'Uat', 'User', 'uat@example.com'],
      ['Yes', 'No', 'Normal', 'User', 'normal@example.com'],
      ['Yes', nil, 'Blank', 'User', 'blank@example.com'],
      ['Yes', 'Maybe', 'Invalid', 'User', 'invalid@example.com']
    ], campaign)

    expect(data[1][:is_uat]).to eq('Yes')
    expect(data[2][:is_uat]).to eq('No')
    expect(data[3][:is_uat]).to be_nil
    expect(data[4][:is_uat]).to eq('Maybe')
  end
end
