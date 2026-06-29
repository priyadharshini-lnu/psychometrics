# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::Administration::WorkshopFacilitatorsController, type: :request do
  let!(:assessment) { create(:assessment, category: 'psychometric') }
  let!(:superadmin) { create(:superadmin) }
  before { sign_in(superadmin) }

  describe 'GET /workshop_facilitators/search_managers' do
    it 'searches center managers' do
      campaign = create(:campaign)
      admins = create_list(:user, 2, role: User::ADMIN_ROLE)
      search_term = admins[0].first_name
      start_date_time = '2023-07-11 07:00:00 +0400'
      end_date_time = '2023-07-11 08:00:00 +0400'

      create(:membership, user: admins[0], campaign: campaign, role: Membership::CAMPAIGN_ADMIN_ROLE)
      admins.each do |admin|
        admin_availability_date = create(
          :user_availability_date,
          timezone: 'Asia/Muscat',
          user: admin,
          start_date: Date.parse('2023-07-10'),
          end_date: Date.parse('2023-07-20')
        )
        create(
          :user_availability_day,
          user_availability_date: admin_availability_date,
          day: 2,
          start_time: '06:00:00',
          end_time: '08:00:00'
        )
      end

      get '/api/v2/administration/workshop_facilitators/search_managers',
          params: {
            start_date_time: start_date_time,
            end_date_time: end_date_time,
            campaign_id: campaign.id,
            search_term: search_term
          },
          headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:ok)
      data = JSON.parse(response.body)['data']
      facilitators = data.find { |d| d['id'] == admins[0].id.to_s }
      expect(data.length).to eq(1)
      expect(facilitators).to have_key('id')
      expect(facilitators).to have_attribute('photo_url')
      expect(facilitators).to have_attribute(:full_name).with_value(admins[0].decorate.display_name)
      expect(facilitators).to have_attribute(:email).with_value(admins[0].email)
    end
  end

  describe 'GET /workshop_facilitators/search_assessors' do
    it 'searches assessors' do
      global_assessor = create(:user, role: User::ADMIN_ROLE, global_assessor: true)
      not_global_assessor = create(:user, role: User::ADMIN_ROLE, global_assessor: false)
      search_term = global_assessor.first_name
      start_date_time = '2023-07-11 07:00:00 +0400'
      end_date_time = '2023-07-11 08:00:00 +0400'

      [global_assessor, not_global_assessor].each do |admin|
        admin_availability_date = create(
          :user_availability_date,
          timezone: 'Asia/Muscat',
          user: admin,
          start_date: Date.parse('2023-07-10'),
          end_date: Date.parse('2023-07-20')
        )
        create(
          :user_availability_day,
          user_availability_date: admin_availability_date,
          day: 2,
          start_time: '06:00:00',
          end_time: '08:00:00'
        )
      end

      get '/api/v2/administration/workshop_facilitators/search_assessors',
          params: {
            start_date_time: start_date_time,
            end_date_time: end_date_time,
            search_term: search_term
          },
          headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:ok)
      data = JSON.parse(response.body)['data']
      assessors = data.find { |d| d['id'] == global_assessor.id.to_s }
      expect(data.length).to eq(1)
      expect(assessors).to have_key('id')
      expect(assessors).to have_attribute('photo_url')
      expect(assessors).to have_attribute(:full_name).with_value(global_assessor.decorate.display_name)
      expect(assessors).to have_attribute(:email).with_value(global_assessor.email)
    end
  end
end
