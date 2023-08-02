# frozen_string_literal: true

require 'faker'

campaign_id = ENV['CAMPAIGN_ID']

ApplicationRecord.transaction do
  campaign = Campaign.find(campaign_id)
  center_manager = Users::Admin.create!(
    first_name: Faker::Name.first_name,
    last_name: Faker::Name.last_name,
    email: Faker::Internet.email,
    password: 'Random@password1'
  )
  Membership.create!(
    role: :campaign_admin,
    client_id: campaign.project.parent.id,
    campaign: campaign,
    user_id: center_manager.id,
    grants_attributes: {
      data: {
        campaigns: %w[manage view manage_users manage_options manage_report_approvals]
      }
    }
  )

  assessor_user = Users::Admin.create!(
    first_name: Faker::Name.first_name,
    last_name: Faker::Name.last_name,
    email: Faker::Internet.email,
    password: 'Random@password1'
  )
  Assessor.create(campaign: campaign, user_id: assessor_user.id)

  subject_user = Users::Regular.create!(
    first_name: Faker::Name.first_name,
    last_name: Faker::Name.last_name,
    email: Faker::Internet.email,
    password: 'Random@password1'
  )
  CampaignUser.create!(campaign: campaign, user: subject_user)

  workshop = Workshop.create!(
    campaign_id: campaign_id,
    start_time: 1.day.ago,
    duration: 4.hours,
    total_seats: 10,
    booked_seats: 4,
    timezone: 'Asia/Kabul',
    video_call_type: :custom,
    meeting_link: 'https://meet.google.com/abc-defg-hij'
  )
  workshop_invite = workshop.workshop_invites.create!(title: 'Workshop Invite Title',
                                                      description: 'Workshop Invite Description')
  workshop_invite.workshop_invited_subjects.create!(user: subject_user)

  workshop_invite.workshop_invite_logs.create!(user: subject_user, created_by: subject_user, action: :accepted)
  workshop_invite.workshop_invite_logs.create!(user: subject_user, created_by: subject_user,
    action: :requested_rescheduling)
  workshop_invite.workshop_invite_logs.create!(user: subject_user, created_by: center_manager, action: :rescheduled)

  workshop.workshop_subjects.create!(user: subject_user)
  workshop.workshop_assessors.create!(user: assessor_user)
  workshop.workshop_managers.create!(user: center_manager)

  accessor_day = assessor_user.user_availability_dates.create!(
    timezone: 'Asia/Kabul', start_date: 1.day.ago, end_date: 10.days.from_now
  )
  accessor_day.user_availability_days.create!(day: 1, start_time: '09:00', end_time: '13:00')
  center_manager_day = center_manager.user_availability_dates.create!(
    timezone: 'Asia/Kabul', start_date: 2.days.ago, end_date: 10.days.from_now
  )
  center_manager_day.user_availability_days.create!(day: 2, start_time: '09:00', end_time: '13:00')

  workshop.user_bookings.create!(
    user: subject_user, start_time: workshop.start_time, end_time: workshop.start_time + 4.hours
  )
  workshop.user_bookings.create!(
    user: assessor_user, start_time: workshop.start_time, end_time: workshop.start_time + 4.hours
  )
  workshop.user_bookings.create!(
    user: center_manager, start_time: workshop.start_time, end_time: workshop.start_time + 4.hours
  )

  campaign.campaign_assessor_assessments.create!(campaign: campaign,
                                                assessment: Assessment.find_by(category: :assessor_form))
end
