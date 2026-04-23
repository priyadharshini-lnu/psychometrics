# frozen_string_literal: true

require 'rails_helper'

describe EndUser::CampaignUsersController, type: :controller do
  let(:user) { create(:user, :with_project_membership, :with_photo) }
  let!(:campaign_user) { create(:campaign_user, user: user) }
  let(:async_request_uuid) { "#{uuid}|#{user.id}" }
  let(:request_params) { { id: campaign_user.id, campaign_user: { id: campaign_user.id } } }

  before(:each) do
    login_user(user)
  end

  describe 'POST #begin_campaign' do
    before do
      allow(AsyncRequestHandlerJob).to receive(:perform_later)
    end

    context 'proctoring_enabled is true, but selective_proctoring_enabled is true' do
      before do
        allow_any_instance_of(CampaignUser).to receive(:proctoring_enabled?).and_return(true)
        allow_any_instance_of(Campaign).to receive(:selective_proctoring_enabled?).and_return(true)
      end

      context 'campaign is not started yet' do
        it 'queues the request and sets status to in progress (standard flow)' do
          post :begin_campaign, params: request_params

          expect(campaign_user.reload.status).to eq('in_progress')
        end
      end
    end

    context 'proctoring is enabled' do
      before do
        allow_any_instance_of(CampaignUser).to receive(:proctoring_enabled?).and_return(true)
      end

      context 'campaign is not started yet' do
        it 'queues the request and sets status to in progress' do
          post :begin_campaign, params: request_params

          expect(response).to have_http_status(:ok)
          expect(AsyncRequestHandlerJob).to have_received(:perform_later)

          async_request_uuid = assigns(:async_request_uuid)
          status, response = AsyncResponseRequest::GetAsyncResponse.call!(async_request_uuid)
          expect(status).to eq('not_started')
          expect(response).to be_an_instance_of(AsyncResponseRequest::AsyncResponse)
          expect(response.processing_status).to eq('not_started')
        end
      end
    end

    context 'proctoring is not enabled' do
      before do
        allow_any_instance_of(CampaignUser).to receive(:proctoring_enabled?).and_return(false)
      end

      context 'campaign is not started yet' do
        it 'queues the request and sets status to in progress' do
          post :begin_campaign, params: request_params

          expect(campaign_user.reload.status).to eq('in_progress')
        end
      end
    end

    context 'when the campaign is already started' do
      it 'returns a 422 status code' do
        campaign_user.update(status: :in_progress)

        post :begin_campaign, params: request_params

        expect(response).to have_http_status(:unprocessable_entity)
      end
    end

    it 'returns a 422 status code when the user has not completed all prework' do
      allow_any_instance_of(CampaignUser).to receive(:all_prework_completed?).and_return(false)

      post :begin_campaign, params: request_params

      expect(response).to have_http_status(:unprocessable_entity)
    end
  end

  describe 'POST #continue_campaign' do
    before do
      allow(AsyncRequestHandlerJob).to receive(:perform_later)
    end

    context 'proctoring is enabled' do
      before do
        allow_any_instance_of(CampaignUser).to receive(:proctoring_enabled?).and_return(true)
      end

      context 'campaign is in progres' do
        it 'queues the request and sets status to in progress' do
          campaign_user.update(status: :in_progress)

          post :continue_campaign, params: request_params

          expect(response).to have_http_status(:ok)
          expect(AsyncRequestHandlerJob).to have_received(:perform_later)

          async_request_uuid = assigns(:async_request_uuid)
          status, response = AsyncResponseRequest::GetAsyncResponse.call!(async_request_uuid)
          expect(status).to eq('not_started')
          expect(response).to be_an_instance_of(AsyncResponseRequest::AsyncResponse)
          expect(response.processing_status).to eq('not_started')
        end
      end
    end

    context 'proctoring is not enabled' do
      before do
        allow_any_instance_of(CampaignUser).to receive(:proctoring_enabled?).and_return(false)
      end

      context 'campaign is in progres' do
        it 'queues the request and sets status to in progress' do
          post :begin_campaign, params: request_params

          expect(campaign_user.reload.status).to eq('in_progress')
        end
      end
    end

    context 'when the campaign is not yet started' do
      it 'returns a 422 status code' do
        campaign_user.update(status: :not_started)

        post :continue_campaign, params: request_params

        expect(response).to have_http_status(:unprocessable_entity)
      end
    end

    it 'returns a 422 status code when the user has not completed all prework' do
      allow(campaign_user).to receive(:all_prework_completed?).and_return(false)

      post :continue_campaign, params: request_params

      expect(response).to have_http_status(:unprocessable_entity)
    end
  end
end
