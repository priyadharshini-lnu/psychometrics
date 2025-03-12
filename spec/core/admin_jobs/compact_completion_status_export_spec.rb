# frozen_string_literal: true

require 'rails_helper'

describe AdminJobs::CompactCompletionStatusExport do
  let!(:campaign) { create(:campaign) }
  let!(:user) { create(:user, email: 'andrew@email.com', first_name: 'Andrew', last_name: 'Wok') }
  let!(:user_one) { create(:user, email: 'james@email.com', first_name: 'James', last_name: 'Bond') }
  let!(:user_two) { create(:user, email: 'bob@email.com', first_name: 'Bob', last_name: 'Jobs') }
  let!(:inactive_user) { create(:user, email: 'inactive@email.com', first_name: 'Inactive', last_name: 'User') }
  let!(:assessment) { create(:assessment, name: 'Assessment') }
  let!(:minor_assessment) { create(:assessment, name: 'Minor Assessment') }
  let!(:super_assessment) { create(:assessment, name: 'Super Assessment') }

  let(:job_record) do
    create(
      :admin_job_record, operation: :compact_completion_status_export,
      data: { campaign_id: campaign.id }
    )
  end

  let!(:user_assessment) do
    create(
      :user_assessment, subject: user, evaluator: user, campaign: campaign,
      assessment: minor_assessment, status: 'interrupted'
    )
  end
  let!(:user_one_user_assessment) do
    create(
      :user_assessment, subject: user_one, evaluator: user_one, campaign: campaign,
      assessment: assessment, status: 'completed'
    )
  end

  let!(:user_two_user_assessment) do
    create(
      :user_assessment, subject: user_two, evaluator: user_two, campaign: campaign,
      assessment: super_assessment, status: 'timed_out'
    )
  end

  let!(:inactive_user_assessment) do
    create(
      :user_assessment, subject: inactive_user, evaluator: inactive_user, campaign: campaign,
      assessment: assessment, status: 'completed'
    )
  end

  before do
    create(:campaign_user, campaign: campaign, user: user, active: true)
    create(:campaign_user, campaign: campaign, user: user_one, active: true)
    create(:campaign_user, campaign: campaign, user: user_two, active: true)
    create(:campaign_user, campaign: campaign, user: inactive_user, active: false)
  end

  it 'first row in csv contains headers' do
    described_class.call!(job_record)

    job_record.file.open do |f|
      csv = Roo::CSV.new(f, csv_options: { converters: [:numeric] })
      actual_first_row = csv.row(1)

      expected_first_row = ['Email', 'First Name', 'Last Name', 'Assessment', 'Minor Assessment', 'Super Assessment']

      expect(actual_first_row).to eq(expected_first_row)
    end
  end

  it 'csv contains each result as separate row' do
    described_class.call!(job_record)

    job_record.file.open do |f|
      csv = Roo::CSV.new(f, csv_options: { converters: [:numeric] })
      expect(csv.last_row).to eq(4)

      expected_last_row = [user_one.email, user_one.first_name, user_one.last_name,
                           user_one_user_assessment.status.titleize, nil, nil]

      expect(csv.row(4)).to eql(expected_last_row)
    end
  end

  it 'update job record count and status' do
    described_class.call!(job_record)

    expect(job_record.file.filename).to eq 'compact-completion-statuses.csv'
    expect(job_record.status).to eq 'completed'
    expect(job_record.total_tasks).to eq 3
    expect(job_record.completed_tasks).to eq 3
  end

  context 'when include_inactive_users is false' do
    before do
      job_record.update(data: { campaign_id: campaign.id, include_inactive_users: false })
    end

    it 'only includes active users in export' do
      described_class.call!(job_record)

      job_record.file.open do |f|
        csv = Roo::CSV.new(f, csv_options: { converters: [:numeric] })
        expect(csv.last_row).to eq(4) # Header + 3 active users

        emails_in_csv = 2.upto(csv.last_row).map { |i| csv.row(i)[0] }
        expect(emails_in_csv).to include(user.email, user_one.email, user_two.email)
        expect(emails_in_csv).not_to include(inactive_user.email)
      end
    end
  end

  context 'when include_inactive_users is true' do
    before do
      job_record.update(data: { campaign_id: campaign.id, include_inactive_users: true })
    end

    it 'includes both active and inactive users in export' do
      described_class.call!(job_record)

      job_record.file.open do |f|
        csv = Roo::CSV.new(f, csv_options: { converters: [:numeric] })
        expect(csv.last_row).to eq(5) # Header + 3 active users + 1 inactive user

        emails_in_csv = 2.upto(csv.last_row).map { |i| csv.row(i)[0] }
        expect(emails_in_csv).to include(user.email, user_one.email, user_two.email, inactive_user.email)
      end
    end
  end
end
