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
      ['Active', 'First Name', 'Last Name', 'Email Address', 'Locale', 'Password',
       'Created Date', 'Custom Field1', 'Custom Field2'],
      {
        active: true,
        first_name: 'Fedor',
        last_name: 'Tar',
        email: 'fedor@gmail.com',
        locale: 'de',
        password: nil,
        created_at: '11 Jul 2020 / 16:39',
        custom_field: 'c1'
      },
      {
        active: true,
        first_name: 'Vlad',
        last_name: 'Ata',
        email: 'vlad@gmail.com',
        locale: 'de',
        password: nil,
        created_at: '11 Jul 2020 / 17:25',
        custom_field: 'c1'
      },
      {
        active: true,
        first_name: 'Rohan',
        last_name: 'R',
        email: 'rohan@gmail.com',
        locale: 'de',
        password: nil,
        created_at: '22 Jul 2020 / 18:40',
        custom_field: 'c1'
      },
      {
        active: true,
        first_name: 'Shuja',
        last_name: 'S',
        email: 'shuja@gmail.com',
        locale: 'de',
        password: nil,
        created_at: '22 Jul 2020 / 19:03',
        custom_field: 'c1'
      }
    ])
  end
end
