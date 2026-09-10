# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::Administration::CommunicationDeliveriesController, type: :controller do
  let(:client) { create(:tenancy) }
  let(:project) { create(:project, parent: client) }
  let(:campaign) { create(:campaign, project: project) }
  let(:superadmin) { create(:superadmin) }

  before do
    allow(Settings.features).to receive(:communication_center_enabled).and_return(true)
    client.client_feature.update!(use_new_communication_center: true)
    sign_in superadmin
    request.headers['Content-Type'] = 'application/vnd.api+json'
  end

  def create_params(template, delivery_rule, delivery_campaign: campaign)
    {
      data: {
        type: 'communication_deliveries',
        attributes: {
          trigger_type: 'manual',
          delivery_rule: delivery_rule,
          recipients: 'all',
          subject: 'Subject',
          body: 'Body'
        },
        relationships: {
          communication_template: {
            data: { type: 'communication_templates', id: template.id.to_s }
          },
          campaign: {
            data: { type: 'campaigns', id: delivery_campaign.id.to_s }
          }
        }
      }
    }
  end

  describe 'POST #create' do
    context "when the target campaign is outside the actor's admin scope (W5.1 regression)" do
      let(:template) do
        create(:communication_template, kind: :invitation, level: :campaign,
                                         client: client, project: project, campaign: campaign)
      end
      let(:other_campaign) { create(:campaign, project: create(:project, parent: create(:tenancy))) }
      let(:campaign_admin) { create(:campaign_admin, campaign: campaign) }

      before { sign_in campaign_admin }

      it 'is rejected with forbidden' do
        post :create, params: create_params(template, 'send_now', delivery_campaign: other_campaign)

        expect(response).to have_http_status(:forbidden)
      end

      it 'does not create a delivery' do
        expect do
          post :create, params: create_params(template, 'send_now', delivery_campaign: other_campaign)
        end.not_to change(CommunicationDelivery, :count)
      end
    end

    context "when the target campaign is within the actor's admin scope" do
      let(:template) do
        create(:communication_template, kind: :invitation, level: :campaign,
                                         client: client, project: project, campaign: campaign)
      end
      let(:campaign_admin) { create(:campaign_admin, campaign: campaign) }

      before { sign_in campaign_admin }

      it 'succeeds' do
        post :create, params: create_params(template, 'send_now')

        expect(response).to have_http_status(:created)
      end
    end

    context 'when the payload is valid' do
      let(:template) do
        create(:communication_template, kind: :invitation, level: :campaign,
                                         client: client, project: project, campaign: campaign)
      end

      it 'creates a delivery scoped to the campaign' do
        post :create, params: create_params(template, 'send_now')

        expect(response).to have_http_status(:created)
        delivery = CommunicationDelivery.last
        expect(delivery.campaign_id).to eq(campaign.id)
        expect(delivery.communication_template_id).to eq(template.id)
      end
    end

    context 'when recipients is selected with communication_delivery_users_attributes' do
      let(:template) do
        create(:communication_template, kind: :invitation, level: :campaign,
                                         client: client, project: project, campaign: campaign)
      end
      let(:user) { create(:user) }

      before { create(:campaign_user, campaign: campaign, user: user) }

      it 'creates the associated communication_delivery_users' do
        params = create_params(template, 'send_now')
        params[:data][:attributes][:recipients] = 'selected'
        params[:data][:attributes][:communication_delivery_users_attributes] = [{ user_id: user.id.to_s }]

        post :create, params: params

        expect(response).to have_http_status(:created)
        expect(CommunicationDelivery.last.selected_users).to contain_exactly(user)
      end
    end

    context 'with communication_delivery_cc_users_attributes' do
      let(:template) do
        create(:communication_template, kind: :invitation, level: :campaign,
                                         client: client, project: project, campaign: campaign)
      end
      let(:cc_user) { create(:user) }

      it 'creates the associated communication_delivery_cc_users' do
        params = create_params(template, 'send_now')
        params[:data][:attributes][:communication_delivery_cc_users_attributes] = [{ user_id: cc_user.id.to_s }]

        post :create, params: params

        expect(response).to have_http_status(:created)
        expect(CommunicationDelivery.last.cc_users).to contain_exactly(cc_user)
      end
    end

    context 'when the template kind is reminder with delivery_rule not_completed' do
      let(:template) do
        create(:communication_template, kind: :reminder, level: :campaign,
                                         client: client, project: project, campaign: campaign)
      end
      let(:assessment) { create(:assessment) }

      before { create(:campaign_assessment, campaign: campaign, assessment: assessment) }

      it 'creates the associated communication_delivery_assessments' do
        params = create_params(template, 'not_completed')
        params[:data][:attributes][:communication_delivery_assessments_attributes] =
          [{ assessment_id: assessment.id.to_s }]

        post :create, params: params

        expect(response).to have_http_status(:created)
        expect(CommunicationDelivery.last.selected_assessments).to contain_exactly(assessment)
      end

      it 'rejects communication_delivery_assessments_attributes for a different delivery_rule' do
        params = create_params(template, 'not_started')
        params[:data][:attributes][:communication_delivery_assessments_attributes] =
          [{ assessment_id: assessment.id.to_s }]

        post :create, params: params

        expect(response).to have_http_status(:unprocessable_content)
      end
    end

    context 'when the template kind is not deliverable' do
      let(:template) do
        create(:communication_template, kind: :workshop_invite_reminder, level: :campaign,
                                         client: client, project: project, campaign: campaign)
      end

      it 'is rejected with unprocessable_content' do
        post :create, params: create_params(template, 'send_now')

        expect(response).to have_http_status(:unprocessable_content)
      end

      it 'does not create a delivery' do
        expect do
          post :create, params: create_params(template, 'send_now')
        end.not_to change(CommunicationDelivery, :count)
      end
    end

    context 'when delivery_rule is not valid for an invitation-kind template' do
      let(:template) do
        create(:communication_template, kind: :invitation, level: :campaign,
                                         client: client, project: project, campaign: campaign)
      end

      it 'is rejected with unprocessable_content' do
        post :create, params: create_params(template, 'not_started')

        expect(response).to have_http_status(:unprocessable_content)
      end

      it 'does not create a delivery' do
        expect do
          post :create, params: create_params(template, 'not_started')
        end.not_to change(CommunicationDelivery, :count)
      end
    end

    context 'when delivery_rule is not valid for a reminder-kind template' do
      let(:template) do
        create(:communication_template, kind: :reminder, level: :campaign,
                                         client: client, project: project, campaign: campaign)
      end

      it 'is rejected with unprocessable_content' do
        post :create, params: create_params(template, 'send_now')

        expect(response).to have_http_status(:unprocessable_content)
      end

      it 'does not create a delivery' do
        expect do
          post :create, params: create_params(template, 'send_now')
        end.not_to change(CommunicationDelivery, :count)
      end
    end

    context 'when the template kind is workshop_invite_reminder' do
      let(:template) do
        create(:communication_template, kind: :workshop_invite_reminder, level: :campaign,
                                         client: client, project: project, campaign: campaign)
      end

      def workshop_params(campaign_assessment_group_id: nil)
        params = create_params(template, nil)
        params[:data][:attributes].delete(:delivery_rule)
        if campaign_assessment_group_id
          params[:data][:attributes][:campaign_assessment_group_id] =
            campaign_assessment_group_id
        end
        params
      end

      it 'is rejected without a campaign_assessment_group_id' do
        post :create, params: workshop_params

        expect(response).to have_http_status(:unprocessable_content)
      end

      it 'is rejected when the campaign_assessment_group_id belongs to a different campaign' do
        other_group = create(:campaign_assessment_group, campaign: create(:campaign, project: project))

        post :create, params: workshop_params(campaign_assessment_group_id: other_group.id)

        expect(response).to have_http_status(:unprocessable_content)
      end

      it 'creates a delivery when campaign_assessment_group_id belongs to the same campaign' do
        group = create(:campaign_assessment_group, campaign: campaign)

        post :create, params: workshop_params(campaign_assessment_group_id: group.id)

        expect(response).to have_http_status(:created)
        expect(CommunicationDelivery.last.campaign_assessment_group_id).to eq(group.id)
      end
    end

    context 'when the template kind is magic_link_email' do
      let(:template) do
        create(:communication_template, kind: :magic_link_email, level: :project,
                                         client: client, project: project, campaign: nil)
      end

      def magic_link_params(project_relationship: project)
        {
          data: {
            type: 'communication_deliveries',
            attributes: { trigger_type: 'manual', subject: 'Subject', body: 'Body' },
            relationships: {
              communication_template: {
                data: { type: 'communication_templates', id: template.id.to_s }
              },
              project: {
                data: project_relationship && { type: 'clients', id: project_relationship.id.to_s }
              }
            }
          }
        }
      end

      it 'creates a delivery scoped to the project with no campaign' do
        post :create, params: magic_link_params

        expect(response).to have_http_status(:created)
        delivery = CommunicationDelivery.last
        expect(delivery.project_id).to eq(project.id)
        expect(delivery.campaign_id).to be_nil
        expect(delivery.status).to eq('active')
      end

      it 'is rejected without a project' do
        post :create, params: magic_link_params(project_relationship: nil)

        expect(response).to have_http_status(:unprocessable_content)
      end
    end

    context 'when the template kind is assessment_center_booking_summary' do
      let(:template) do
        create(:communication_template, kind: :assessment_center_booking_summary, level: :campaign,
                                         client: client, project: project, campaign: campaign)
      end
      let(:selected_user) { create(:user) }

      before { create(:campaign_user, campaign: campaign, user: selected_user) }

      def booking_summary_params(overrides = {})
        params = create_params(template, nil)
        params[:data][:attributes].delete(:delivery_rule)
        params[:data][:attributes][:recipients] = 'selected'
        params[:data][:attributes][:trigger_type] = 'scheduled'
        params[:data][:attributes][:communication_delivery_users_attributes] = [{ user_id: selected_user.id.to_s }]
        params[:data][:attributes].merge!(
          {
            delivery_start_date: Date.current.to_s,
            delivery_end_date: (Date.current + 30.days).to_s,
            delivery_time_of_day: '23:59',
            delivery_timezone: 'UTC',
            delivery_frequency: 'daily'
          }.merge(overrides)
        )
        params
      end

      it 'is rejected without the required schedule fields' do
        params = booking_summary_params
        params[:data][:attributes].delete(:delivery_timezone)

        post :create, params: params

        expect(response).to have_http_status(:unprocessable_content)
      end

      it 'is rejected when delivery_end_date is before delivery_start_date' do
        post :create, params: booking_summary_params(delivery_end_date: (Date.current - 1.day).to_s)

        expect(response).to have_http_status(:unprocessable_content)
      end

      it 'is rejected when the start datetime is in the past' do
        params = booking_summary_params(delivery_start_date: (Date.current - 1.day).to_s, delivery_time_of_day: '00:00')

        post :create, params: params

        expect(response).to have_http_status(:unprocessable_content)
      end

      it 'is rejected when recipients is not selected' do
        params = booking_summary_params
        params[:data][:attributes][:recipients] = 'all'

        post :create, params: params

        expect(response).to have_http_status(:unprocessable_content)
      end

      it 'is rejected when specific_weekdays frequency has no weekdays' do
        post :create, params: booking_summary_params(delivery_frequency: 'specific_weekdays')

        expect(response).to have_http_status(:unprocessable_content)
      end

      it 'creates a delivery with a valid schedule' do
        post :create, params: booking_summary_params

        expect(response).to have_http_status(:created)
        expect(CommunicationDelivery.last.selected_users).to contain_exactly(selected_user)
      end
    end
  end

  describe 'GET #show' do
    let(:delivery) do
      create(:communication_delivery, subject: 'Default subject', body: 'Default body').tap do |d|
        d.client.client_feature.update!(use_new_communication_center: true)
      end
    end

    before do
      delivery # force creation under the default locale before switching to :fr below
      Mobility.with_locale(:fr) { delivery.update!(subject: 'Sujet FR', body: 'Corps FR') }
    end

    it 'renders the default locale content when no locale is given' do
      get :show, params: { id: delivery.id }

      # response.parsed_body doesn't decode application/vnd.api+json (no Mime::Type registered for it)
      json = JSON.parse(response.body)['data']['attributes'] # rubocop:disable Rails/ResponseParsedBody
      expect(json['subject']).to eq('Default subject')
    end

    it 'renders the requested locale content' do
      get :show, params: { id: delivery.id, query: { locale: 'fr' } }

      # response.parsed_body doesn't decode application/vnd.api+json (no Mime::Type registered for it)
      json = JSON.parse(response.body)['data']['attributes'] # rubocop:disable Rails/ResponseParsedBody
      expect(json['subject']).to eq('Sujet FR')
      expect(json['body']).to eq('Corps FR')
    end

    it 'exposes available_locales' do
      get :show, params: { id: delivery.id }

      # response.parsed_body doesn't decode application/vnd.api+json (no Mime::Type registered for it)
      json = JSON.parse(response.body)['data']['attributes'] # rubocop:disable Rails/ResponseParsedBody
      expect(json['available_locales']).to contain_exactly('en', 'fr')
    end
  end

  describe 'POST #update_translation' do
    let(:delivery) do
      create(:communication_delivery, subject: 'Default subject', body: 'Default body').tap do |d|
        d.client.client_feature.update!(use_new_communication_center: true)
      end
    end

    def update_translation_params(locale:, subject: 'Translated subject', body: 'Translated body')
      { id: delivery.id, data: { attributes: { subject: subject, body: body, locale: locale } } }
    end

    it 'saves content under the given locale without touching the default locale' do
      post :update_translation, params: update_translation_params(locale: 'fr')

      expect(response).to have_http_status(:ok)
      expect(Mobility.with_locale(:fr) { delivery.reload.subject }).to eq('Translated subject')
      expect(delivery.subject).to eq('Default subject')
    end

    it 'rejects a locale that is not in I18n.available_locales' do
      post :update_translation, params: update_translation_params(locale: 'not-a-locale')

      expect(response).to have_http_status(:unprocessable_content)
    end
  end

  describe 'POST #cancel' do
    context 'when the delivery is draft, enqueued, active, or paused' do
      %i[draft enqueued active paused].each do |status|
        context "when status is #{status}" do
          let(:delivery) do
            create(:communication_delivery, status: status).tap do |d|
              d.client.client_feature.update!(use_new_communication_center: true)
            end
          end

          it 'transitions the delivery to cancelled' do
            post :cancel, params: { id: delivery.id }

            expect(response).to have_http_status(:ok)
            expect(delivery.reload.status).to eq('cancelled')
          end

          it 'sets cancelled_at' do
            post :cancel, params: { id: delivery.id }

            expect(delivery.reload.cancelled_at).to be_present
          end
        end
      end
    end

    context 'when the delivery is already in a terminal state' do
      %i[completed cancelled failed].each do |status|
        context "when status is #{status}" do
          let(:delivery) do
            create(:communication_delivery, status: status).tap do |d|
              d.client.client_feature.update!(use_new_communication_center: true)
            end
          end

          it 'returns unprocessable entity' do
            post :cancel, params: { id: delivery.id }

            expect(response).to have_http_status(:unprocessable_entity)
          end

          it 'does not change the status' do
            expect do
              post :cancel, params: { id: delivery.id }
            end.not_to(change { delivery.reload.status })
          end
        end
      end
    end
  end
end
