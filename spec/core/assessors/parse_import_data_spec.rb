# frozen_string_literal: true

require 'rails_helper'

describe Assessors::ParseImportData do
  it '.call' do
    file = Rack::Test::UploadedFile.new(Rails.root.join('spec/fixtures/files/assessors_export.csv'), 'text/csv')
    data = described_class.call!(file)
    expect(data).to eq([
      {
        subject_email: 'user1@gmail.com',
        assessor_email: 'newi@gmail.com',
        assessor_first_name: 'Ivan',
        assessor_last_name: 'Kuzmin',
        assessor_password: 'Password@21',
        assessment_ids: [10, 11]
      },
      {
        subject_email: 'user1@gmail.com',
        assessor_email: 'newi2@gmail.com',
        assessor_first_name: 'Ivan',
        assessor_last_name: 'Kuzmin',
        assessor_password: 'Password@21',
        assessment_ids: [10, 11]
      }
    ])
  end
end
