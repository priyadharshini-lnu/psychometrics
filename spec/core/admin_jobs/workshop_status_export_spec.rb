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
      'AC Group Name',
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
      score_calculated: true, prework: true
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
    assessment_group = create(:campaign_assessment_group, campaign: campaign, name: 'Test Group')
    create(:workshop_invited_subject, user: user,
workshop_invite: create(:workshop_invite, campaign: campaign, campaign_assessment_group: assessment_group))
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
      'Test Group',
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
    assessment_group = create(:campaign_assessment_group, campaign: campaign, name: 'Test Group')
    workshop = create(:workshop, campaign: campaign, campaign_assessment_group: assessment_group)
    create(:workshop_invited_subject, user: user,
workshop_invite: create(:workshop_invite, campaign: campaign, campaign_assessment_group: assessment_group))
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

    actual_last_row = job_record.file.open do |f|
      csv = Roo::CSV.new(f, csv_options: { converters: [:numeric] })
      csv.row(4)
    end

    expect(actual_last_row).to eq([
      user.id,
      user.first_name,
      user.last_name,
      user.email,
      campaign.name,
      'Yes',
      'Completed',
      nil,
      'Scheduled',
      'Test Group',
      workshop.name,
      'Invited',
      'In Progress',
      workshop_subject.attendance_status.humanize,
      workshop.start_time.to_s,
      workshop_subject.preferred_language,
      0,
      0
    ])
  end

  it 'export correct details for invited subject that have accepted the invite and completed center activities' do
    create(:campaign_user, campaign: campaign, user: user)
    assessment_group = create(:campaign_assessment_group, campaign: campaign, name: 'Test Group')
    workshop = create(:workshop, campaign: campaign, campaign_assessment_group: assessment_group)
    create(:workshop_invited_subject, user: user,
workshop_invite: create(:workshop_invite, campaign: campaign, campaign_assessment_group: assessment_group))
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
      'Test Group',
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

  it 'only exports active users when include_inactive_users is false' do
    active_user = create(:user, project: project)
    create(:campaign_user, campaign: campaign, user: active_user, active: true)

    inactive_user = create(:user, project: project)
    create(:campaign_user, campaign: campaign, user: inactive_user, active: false)

    job_record.update(data: { project_id: project.id, include_inactive_users: false })

    described_class.call!(job_record)

    csv = CsvUtf8.to_array(active_storage_file_path(job_record.file))

    expect(csv.size).to eq(2)
    expect(csv[1][0]).to eq(active_user.id.to_s)
  end

  it 'exports both active and inactive users when include_inactive_users is true' do
    active_user = create(:user, project: project)
    create(:campaign_user, campaign: campaign, user: active_user, active: true)

    inactive_user = create(:user, project: project)
    create(:campaign_user, campaign: campaign, user: inactive_user, active: false)

    job_record.update(data: { project_id: project.id, include_inactive_users: true })

    described_class.call!(job_record)

    csv = CsvUtf8.to_array(active_storage_file_path(job_record.file))

    expect(csv.size).to eq(3)

    user_ids_in_csv = csv[1..].pluck(0)
    expect(user_ids_in_csv).to include(active_user.id.to_s, inactive_user.id.to_s)
  end

  it 'exports separate rows for user with multiple workshop assessment groups' do
    create(:campaign_user, campaign: campaign, user: user)

    assessment_group1 = create(:campaign_assessment_group, campaign: campaign, name: 'Group A')
    assessment_group2 = create(:campaign_assessment_group, campaign: campaign, name: 'Group B')

    workshop1 = create(:workshop, campaign: campaign, campaign_assessment_group: assessment_group1, name: 'Workshop A')
    workshop2 = create(:workshop, campaign: campaign, campaign_assessment_group: assessment_group2, name: 'Workshop B')

    create(
      :workshop_subject, user: user, workshop: workshop1, campaign: campaign,
      preferred_language: 'en', scheduling_status: :scheduled
    )
    create(
      :workshop_subject, user: user, workshop: workshop2, campaign: campaign,
      preferred_language: 'ar', scheduling_status: :late_cancelled
    )

    described_class.call!(job_record)

    csv = CsvUtf8.to_array(active_storage_file_path(job_record.file))

    expect(csv.size).to eq(3)

    expect(csv[1][0]).to eq(user.id.to_s)
    expect(csv[2][0]).to eq(user.id.to_s)

    assessment_group_names = [csv[1][9], csv[2][9]]
    expect(assessment_group_names).to contain_exactly('Group A', 'Group B')

    workshop_names = [csv[1][10], csv[2][10]]
    expect(workshop_names).to contain_exactly('Workshop A', 'Workshop B')

    scheduling_statuses = [csv[1][8], csv[2][8]]
    expect(scheduling_statuses).to contain_exactly('Scheduled', 'Late cancelled')
  end

  it 'picks the scheduled workshop subject as latest when one exists among rescheduled ones with latest created_at' do
    create(:campaign_user, campaign: campaign, user: user)

    assessment_group = create(:campaign_assessment_group, campaign: campaign, name: 'Test Group')
    workshop_old = create(:workshop, campaign: campaign, campaign_assessment_group: assessment_group,
                   name: 'Old Workshop')
    workshop_rescheduled = create(:workshop, campaign: campaign, campaign_assessment_group: assessment_group,
                   name: 'Re-Scheduled Workshop')

    create(
      :workshop_subject, user: user, workshop: workshop_old, campaign: campaign,
      scheduling_status: :scheduled, created_at: 2.days.ago
    )
    create(
      :workshop_subject, user: user, workshop: workshop_rescheduled, campaign: campaign,
      scheduling_status: :rescheduled, created_at: 1.day.ago
    )

    described_class.call!(job_record)

    csv = CsvUtf8.to_array(active_storage_file_path(job_record.file))

    expect(csv[1][8]).to eq('Scheduled')
    expect(csv[1][10]).to eq('Old Workshop')
  end

  it 'picks the most recent non-rescheduled workshop subject when none are scheduled' do
    create(:campaign_user, campaign: campaign, user: user)

    assessment_group = create(:campaign_assessment_group, campaign: campaign, name: 'Test Group')
    workshop_rescheduled = create(:workshop, campaign: campaign, campaign_assessment_group: assessment_group,
                           name: 'Rescheduled Workshop')
    workshop_late_rescheduled = create(:workshop, campaign: campaign, campaign_assessment_group: assessment_group,
                                name: 'Late Rescheduled Workshop')
    workshop_cancelled = create(:workshop, campaign: campaign, campaign_assessment_group: assessment_group,
                         name: 'Cancelled Workshop')

    create(
      :workshop_subject, user: user, workshop: workshop_rescheduled, campaign: campaign,
      scheduling_status: :rescheduled, created_at: 1.day.ago
    )
    create(
      :workshop_subject, user: user, workshop: workshop_late_rescheduled, campaign: campaign,
      scheduling_status: :late_rescheduled, created_at: 2.days.ago
    )
    create(
      :workshop_subject, user: user, workshop: workshop_cancelled, campaign: campaign,
      scheduling_status: :cancelled, created_at: 3.days.ago
    )

    described_class.call!(job_record)

    csv = CsvUtf8.to_array(active_storage_file_path(job_record.file))

    expect(csv[1][8]).to eq('Cancelled')
    expect(csv[1][10]).to eq('Cancelled Workshop')
  end
end
