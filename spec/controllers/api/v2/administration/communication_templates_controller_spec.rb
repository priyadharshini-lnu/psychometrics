# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::Administration::CommunicationTemplatesController, type: :controller do
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

  let(:template) do
    create(:communication_template, client: client, project: project, campaign: campaign,
                                     subject: 'Default subject', body: 'Default body')
  end

  describe 'GET #show' do
    before do
      template # force creation under the default locale before switching to :fr below
      Mobility.with_locale(:fr) { template.update!(subject: 'Sujet FR', body: 'Corps FR') }
    end

    it 'renders the default locale content when no locale is given' do
      get :show, params: { id: template.id }

      # response.parsed_body doesn't decode application/vnd.api+json (no Mime::Type registered for it)
      json = JSON.parse(response.body)['data']['attributes'] # rubocop:disable Rails/ResponseParsedBody
      expect(json['subject']).to eq('Default subject')
    end

    it 'renders the requested locale content' do
      get :show, params: { id: template.id, query: { locale: 'fr' } }

      # response.parsed_body doesn't decode application/vnd.api+json (no Mime::Type registered for it)
      json = JSON.parse(response.body)['data']['attributes'] # rubocop:disable Rails/ResponseParsedBody
      expect(json['subject']).to eq('Sujet FR')
      expect(json['body']).to eq('Corps FR')
    end

    it 'exposes available_locales' do
      get :show, params: { id: template.id }

      # response.parsed_body doesn't decode application/vnd.api+json (no Mime::Type registered for it)
      json = JSON.parse(response.body)['data']['attributes'] # rubocop:disable Rails/ResponseParsedBody
      expect(json['available_locales']).to contain_exactly('en', 'fr')
    end
  end

  describe 'POST #create' do
    def create_params(project_id)
      {
        data: {
          type: 'communication_templates',
          attributes: { name: 'A template', kind: 'invitation', level: 'project' },
          relationships: { project: { data: { type: 'clients', id: project_id.to_s } } }
        }
      }
    end

    context "when the target project is outside the actor's admin scope (W5.1 regression)" do
      let(:project_admin) { create(:project_admin, project: project) }
      let(:other_project) { create(:project, parent: create(:tenancy)) }

      before { sign_in project_admin }

      it 'is rejected with forbidden' do
        post :create, params: create_params(other_project.id)

        expect(response).to have_http_status(:forbidden)
      end

      it 'does not create a template' do
        expect do
          post :create, params: create_params(other_project.id)
        end.not_to change(CommunicationTemplate, :count)
      end
    end

    context "when the target project is within the actor's admin scope" do
      let(:project_admin) { create(:project_admin, project: project) }

      before { sign_in project_admin }

      it 'succeeds' do
        post :create, params: create_params(project.id)

        expect(response).to have_http_status(:created)
      end
    end
  end

  describe 'POST #update_translation' do
    def update_translation_params(locale:, subject: 'Translated subject', body: 'Translated body')
      { id: template.id, data: { attributes: { subject: subject, body: body, locale: locale } } }
    end

    it 'saves content under the given locale without touching the default locale' do
      post :update_translation, params: update_translation_params(locale: 'fr')

      expect(response).to have_http_status(:ok)
      expect(Mobility.with_locale(:fr) { template.reload.subject }).to eq('Translated subject')
      expect(template.subject).to eq('Default subject')
    end

    it 'rejects a locale that is not in I18n.available_locales' do
      post :update_translation, params: update_translation_params(locale: 'not-a-locale')

      expect(response).to have_http_status(:unprocessable_content)
    end
  end
end
