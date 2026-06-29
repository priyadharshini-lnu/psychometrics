# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::Administration::WorkshopActivitiesController, type: :request do
  let(:superadmin) { create(:superadmin) }
  let(:campaign) { create(:campaign) }
  let(:campaign_id) { campaign.id }
  let(:workshop) { create(:workshop, campaign_id: campaign_id) }
  let(:workshop_id) { workshop.id }
  let!(:subject) { create(:workshop_subject, workshop: workshop) }
  let!(:assessor) { create(:assessor, campaign: campaign) }
  before do
    completed = create(:user_assessment, campaign: campaign, subject: subject.user,
                       status: 2, evaluator: assessor.user)
    another_completed = create(:user_assessment, campaign: campaign,
                               subject: subject.user, status: 2, evaluator: assessor.user)
    not_completed = create(:user_assessment, campaign: campaign, subject: subject.user, evaluator: assessor.user)

    create(:campaign_assessment, assessment: completed.assessment, campaign: campaign,
      prework: true, workshop_activity: true)
    create(:campaign_assessment, assessment: another_completed.assessment, campaign: campaign,
      prework: true, workshop_activity: true)
    create(:campaign_assessment, assessment: not_completed.assessment, campaign: campaign,
      prework: true, workshop_activity: true)

    sign_in(superadmin)
  end

  describe 'GET /campaigns/:campaign_id/workshops/:workshop_id/workshop_activities' do
    it 'fetches campaign Workshop Activity list' do
      get "/api/v2/administration/campaigns/#{campaign_id}/workshops/#{workshop_id}/workshop_activities",
          headers: { 'Content-Type' => 'application/vnd.api+json' }

      activity_response = JSON.parse(response.body)['data'].first
      expect(activity_response).to have_relationship(:subject).
        with_data({ 'id' => subject.user_id.to_s, 'type' => 'users' })
    end
  end
end
