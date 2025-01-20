# frozen_string_literal: true

require 'rails_helper'

describe AdminJobs::WorkshopStatusExport do
  let(:campaign) { create(:campaign) }
  let(:project) { campaign.project }
  let(:user) { create(:user, project: project) }
  let(:assessment) { project.assessments.take }
  let(:job_record) do
    create(
      :admin_job_record, operation: :workshop_status_export,
      data: { project_id: project.id }
    )
  end

  it 'export correct headers' do
    described_class.call!(job_record)

    csv = CsvUtf8.to_array(active_storage_file_path(job_record.file))
    expect(csv[0]).to eq([
      'Id',
      'First name',
      'Last name',
      'Email',
      'Campaign',
      'User Active',
      'Prework Status',
      'Prework Completed Date',
      'Scheduling Status',
      'AC Name',
      'AC Invite',
      'AC Activity Completion',
      'AC Attendance Status',
      'AC Date',
      'Preferred Language',
      'Late Cancelled',
      'Late Rescheduled'
    ])
  end

  it 'export correct details for non invited subject' do
    create(:campaign_user, campaign: campaign, user: user)
    prework_activity = create(:campaign_assessment, campaign: campaign, prework: true)
    create(
      :user_assessment, campaign: campaign,
      subject: user, evaluator: user,
      assessment: prework_activity.assessment, status: :completed, completed_at: 1.day.ago,
      score_calculated: true
    )
    described_class.call!(job_record)

    actual_second_row = job_record.file.open do |f|
      csv = Roo::CSV.new(f, csv_options: { converters: [:numeric] })
      csv.row(2)
    end

    expect(actual_second_row).to eq([
      user.id,
      user.first_name,
      user.last_name,
      user.email,
      campaign.name,
      'Yes',
      'Completed',
      1.day.ago.to_s,
      nil,
      nil,
      'Not Invited',
      nil,
      nil,
      nil,
      nil,
      0,
      0
    ])
  end

  it 'export correct details for invited subject that have not accepted the invite' do
    create(:campaign_user, campaign: campaign, user: user)
    create(:workshop_invited_subject, user: user, workshop_invite: create(:workshop_invite, campaign: campaign))
    described_class.call!(job_record)

    actual_second_row = job_record.file.open do |f|
      csv = Roo::CSV.new(f, csv_options: { converters: [:numeric] })
      csv.row(2)
    end

    expect(actual_second_row).to eq([
      user.id,
      user.first_name,
      user.last_name,
      user.email,
      campaign.name,
      'Yes',
      'Completed',
      nil,
      nil,
      nil,
      'Invited',
      nil,
      nil,
      nil,
      nil,
      0,
      0
    ])
  end

  it 'export correct details for invited subject that have accepted the invite and not completed center activities' do
    create(:campaign_user, campaign: campaign, user: user)
    workshop = create(:workshop, campaign: campaign)
    create(:workshop_invited_subject, user: user, workshop_invite: create(:workshop_invite, campaign: campaign))
    create(
      :workshop_subject, user: user, campaign: campaign, preferred_language: 'en', scheduling_status: :late_cancelled,
      created_at: 1.day.ago
    )
    create(
      :workshop_subject, user: user, campaign: campaign, preferred_language: 'en', scheduling_status: :late_rescheduled,
      created_at: 2.days.ago
    )
    workshop_subject = create(
      :workshop_subject, user: user, workshop: workshop, campaign: campaign, preferred_language: 'ar'
    )
    workshop_activity = create(:campaign_assessment, campaign: campaign, workshop_activity: true)
    create(
      :user_assessment, campaign: campaign,
      subject: user, evaluator: user,
      assessment: workshop_activity.assessment, status: :in_progress
    )

    described_class.call!(job_record)

    actual_second_row = job_record.file.open do |f|
      csv = Roo::CSV.new(f, csv_options: { converters: [:numeric] })
      csv.row(2)
    end

    expect(actual_second_row).to eq([
      user.id,
      user.first_name,
      user.last_name,
      user.email,
      campaign.name,
      'Yes',
      'Completed',
      nil,
      'Scheduled',
      workshop.name,
      'Invited',
      'In Progress',
      workshop_subject.attendance_status.humanize,
      workshop.start_time.to_s,
      workshop_subject.preferred_language,
      1,
      1
    ])
  end

  it 'export correct details for invited subject that have accepted the invite and completed center activities' do
    create(:campaign_user, campaign: campaign, user: user)
    workshop = create(:workshop, campaign: campaign)
    create(:workshop_invited_subject, user: user, workshop_invite: create(:workshop_invite, campaign: campaign))
    workshop_subject = create(
      :workshop_subject, user: user, workshop: workshop, campaign: campaign, preferred_language: 'en'
    )
    workshop_activity = create(:campaign_assessment, campaign: campaign, workshop_activity: true)
    create(
      :user_assessment, campaign: campaign,
      subject: user, evaluator: user,
      assessment: workshop_activity.assessment, status: :completed
    )

    described_class.call!(job_record)

    actual_second_row = job_record.file.open do |f|
      csv = Roo::CSV.new(f, csv_options: { converters: [:numeric] })
      csv.row(2)
    end

    expect(actual_second_row).to eq([
      user.id,
      user.first_name,
      user.last_name,
      user.email,
      campaign.name,
      'Yes',
      'Completed',
      nil,
      'Scheduled',
      workshop.name,
      'Invited',
      'Completed',
      workshop_subject.attendance_status.humanize,
      workshop.start_time.to_s,
      workshop_subject.preferred_language,
      0,
      0
    ])
  end
end
