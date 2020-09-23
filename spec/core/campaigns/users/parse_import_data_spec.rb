# frozen_string_literal: true

require 'rails_helper'

describe Campaigns::Users::ParseImportData do
  it '.call' do
    file = Rack::Test::UploadedFile.new(Rails.root.join('spec/fixtures/files/users_export.csv'), 'text/csv')
    data = described_class.call!(file)

    expect(data).to eq([
                         ['Active', 'First Name', 'Last Name', 'Email Address', 'Password', 'Created Date'],
                         {
                           active: true,
                           first_name: 'Fedor',
                           last_name: 'Tar', email: 'fedor@gmail.com',
                           password: nil,
                           created_at: '11 Jul 2020 / 16:39'
                         },
                         {
                           active: true,
                           first_name: 'Vlad',
                           last_name: 'Ata',
                           email: 'vlad@gmail.com',
                           password: nil,
                           created_at: '11 Jul 2020 / 17:25'
                         },
                         {
                           active: true,
                           first_name: 'Rohan',
                           last_name: 'R',
                           email: 'rohan@gmail.com',
                           password: nil,
                           created_at: '22 Jul 2020 / 18:40'
                         },
                         {
                           active: true,
                           first_name: 'Shuja',
                           last_name: 'S',
                           email: 'shuja@gmail.com',
                           password: nil,
                           created_at: '22 Jul 2020 / 19:03'
                         }
                       ])
  end
end
