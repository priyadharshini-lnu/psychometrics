# frozen_string_literal: true

require 'rails_helper'

RSpec.describe AdminJobs::ExportUsers, type: :job do
  let(:campaign) { create(:campaign) }
  let!(:user) { create(:user, :with_photo, email: 'user@example.com', project: campaign.project) }
  let!(:campaign_user) { create(:campaign_user, campaign: campaign, user: user) }

  let(:job_record) do
    create(:admin_job_record, operation: :export_users, data: { campaign_id: campaign.id, export_sign_in_url: false })
  end
  let(:job) { described_class.new(job_record) }

  it 'first row in csv contains export_headers, profile_fields and profile_custom_fields' do
    described_class.call!(job_record)
    csv = CsvUtf8.to_array(active_storage_file_path(job_record.file))
    actual_first_row = csv[0]

    expected_first_row = [
      'Active',
      'UAT',
      'First Name',
      'Last Name',
      'Email Address',
      'Mobile number',
      'Password',
      'Overwrite password',
      'Schedule start date',
      'Schedule end date',
      'Created Date',
      'Manager email',
      'Current job role',
      'Target job role',
      'Level',
      'age',
      'gender',
      'locale'
    ]

    expect(actual_first_row).to eq(expected_first_row)
  end

  it 'csv contains each user result as separate row' do
    described_class.call!(job_record)
    csv = CsvUtf8.to_array(active_storage_file_path(job_record.file))
    actual_user_data_row = csv[1]
    expected_user_data_row = [
      'Yes',
      'No',
      user.first_name,
      user.last_name,
      user.email,
      user.mobile_number,
      nil,
      nil,
      campaign_user.schedule_start_date,
      campaign_user.schedule_end_date,
      user.decorate.created_at,
      user.manager_email,
      nil,
      nil,
      nil,
      '1',
      'female',
      'MyString'
    ]

    expect(actual_user_data_row).to eq(expected_user_data_row)
  end
end
