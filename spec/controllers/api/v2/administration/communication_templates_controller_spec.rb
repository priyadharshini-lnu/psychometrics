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

  describe 'GET #index copy source candidates' do
    let(:other_project) { create(:project, parent: client) }
    let(:other_campaign) { create(:campaign, project: other_project) }
    let(:other_client) { create(:tenancy) }
    let(:cross_client_project) { create(:project, parent: other_client) }
    let(:cross_client_campaign) { create(:campaign, project: cross_client_project) }

    before do
      other_client.client_feature.update!(use_new_communication_center: true)
    end

    def candidate_ids(level, scope_filter)
      get :index, params: {
        filter: {
          level_eq: level,
          only_copy_candidates: true
        }.merge(scope_filter)
      }

      JSON.parse(response.body).fetch('data').pluck('id') # rubocop:disable Rails/ResponseParsedBody
    end

    it 'returns no candidates when requesting client level candidates' do
      create(:communication_template, level: :client, client: client, project: nil, campaign: nil)

      ids = candidate_ids('client', client_id_eq: client.id.to_s)

      expect(response).to have_http_status(:ok)
      expect(ids).to be_empty
    end

    it 'lists accessible project templates only within the destination client' do
      destination_project_source = create(
        :communication_template,
        level: :project,
        client: client,
        project: project,
        campaign: nil
      )
      source = create(
        :communication_template,
        level: :project,
        client: client,
        project: other_project,
        campaign: nil
      )
      cross_client_source = create(
        :communication_template,
        level: :project,
        client: other_client,
        project: cross_client_project,
        campaign: nil
      )

      ids = candidate_ids('project', project_id_eq: project.id.to_s)

      expect(response).to have_http_status(:ok)
      expect(ids).to contain_exactly(destination_project_source.id.to_s, source.id.to_s)
      expect(ids).not_to include(cross_client_source.id.to_s)
    end

    it 'lists accessible campaign templates only within the destination client' do
      destination_campaign_source = create(
        :communication_template,
        client: client,
        project: project,
        campaign: campaign
      )
      source = create(
        :communication_template,
        client: client,
        project: other_project,
        campaign: other_campaign
      )
      cross_client_source = create(
        :communication_template,
        client: other_client,
        project: cross_client_project,
        campaign: cross_client_campaign
      )

      ids = candidate_ids('campaign', campaign_id_eq: campaign.id.to_s)

      expect(response).to have_http_status(:ok)
      expect(ids).to contain_exactly(destination_campaign_source.id.to_s, source.id.to_s)
      expect(ids).not_to include(cross_client_source.id.to_s)
    end

    it 'lets a client admin see templates across projects in their client' do
      client_admin = create(:client_admin, client: client)
      destination_project_source = create(
        :communication_template,
        level: :project,
        client: client,
        project: project,
        campaign: nil
      )
      other_project_source = create(
        :communication_template,
        level: :project,
        client: client,
        project: other_project,
        campaign: nil
      )
      sign_in client_admin

      ids = candidate_ids('project', project_id_eq: project.id.to_s)

      expect(ids).to contain_exactly(destination_project_source.id.to_s, other_project_source.id.to_s)
    end

    it 'lets a project admin see campaign templates across campaigns in their project' do
      other_project_campaign = create(:campaign, project: project)
      project_admin = create(:project_admin, project: project)
      destination_campaign_source = create(
        :communication_template,
        client: client,
        project: project,
        campaign: campaign
      )
      other_campaign_source = create(
        :communication_template,
        client: client,
        project: project,
        campaign: other_project_campaign
      )
      create(:communication_template, client: client, project: other_project, campaign: other_campaign)
      sign_in project_admin

      ids = candidate_ids('campaign', campaign_id_eq: campaign.id.to_s)

      expect(ids).to contain_exactly(destination_campaign_source.id.to_s, other_campaign_source.id.to_s)
    end

    it 'lets a campaign admin see templates only in their campaign' do
      campaign_admin = create(:campaign_admin, campaign: campaign)
      campaign_source = create(:communication_template, client: client, project: project, campaign: campaign)
      create(:communication_template, client: client, project: other_project, campaign: other_campaign)
      sign_in campaign_admin

      ids = candidate_ids('campaign', campaign_id_eq: campaign.id.to_s)

      expect(ids).to contain_exactly(campaign_source.id.to_s)
    end
  end

  describe 'POST #copy' do
    let(:target_project) { create(:project, parent: client) }
    let(:target_campaign) { create(:campaign, project: target_project) }
    let(:other_client) { create(:tenancy) }
    let(:other_project) { create(:project, parent: other_client) }
    let(:other_campaign) { create(:campaign, project: other_project) }
    let(:parent_template) do
      create(:communication_template, level: :project, client: client, project: project, campaign: nil)
    end

    before do
      other_client.client_feature.update!(use_new_communication_center: true)
      template.update!(
        name: 'Source template',
        status: :active,
        recipients_default: :selected,
        delivery_defaults: { send_offset_days: 2 },
        inherits_from_template: parent_template
      )
      Mobility.with_locale(:fr) { template.update!(subject: 'Sujet FR', body: 'Corps FR') }
    end

    def copy_params(template, attributes)
      {
        id: template.id,
        data: {
          type: 'communication_templates',
          attributes: attributes
        }
      }
    end

    it 'creates a template copy in the same scope with copied settings' do
      expect do
        post :copy, params: copy_params(template, target_campaign_id: target_campaign.id)
      end.to change(CommunicationTemplate, :count).by(1)

      expect(response).to have_http_status(:ok)

      copy = CommunicationTemplate.order(:id).last
      expect(copy).to have_attributes(
        name: 'Source template (Copy)',
        kind: template.kind,
        level: template.level,
        status: template.status,
        recipients_default: template.recipients_default,
        delivery_defaults: { 'send_offset_days' => 2 },
        client_id: client.id,
        project_id: target_project.id,
        campaign_id: target_campaign.id,
        inherits_from_template_id: parent_template.id,
        created_by_id: superadmin.id,
        updated_by_id: superadmin.id
      )
    end

    it 'copies all translated subject and body content' do
      post :copy, params: copy_params(template, target_campaign_id: target_campaign.id)

      copy = CommunicationTemplate.order(:id).last
      expect(Mobility.with_locale(:en) { copy.subject }).to eq('Default subject')
      expect(Mobility.with_locale(:en) { copy.body }).to eq('Default body')
      expect(Mobility.with_locale(:fr) { copy.subject }).to eq('Sujet FR')
      expect(Mobility.with_locale(:fr) { copy.body }).to eq('Corps FR')
    end

    it 'copies a project template within the client' do
      template.update!(level: :project, project: project, campaign: nil)

      post :copy, params: copy_params(template, target_project_id: target_project.id)

      expect(response).to have_http_status(:ok)
      copy = CommunicationTemplate.order(:id).last
      expect(copy).to have_attributes(
        level: 'project',
        client_id: client.id,
        project_id: target_project.id,
        campaign_id: nil
      )
    end

    it 'rejects copying a client template' do
      template.update!(level: :client, project: nil, campaign: nil)

      expect do
        post :copy, params: copy_params(template, target_project_id: target_project.id)
      end.not_to change(CommunicationTemplate, :count)

      expect(response).to have_http_status(:unprocessable_content)
    end

    it 'allows copying within the source template campaign' do
      expect do
        post :copy, params: copy_params(template, target_campaign_id: campaign.id)
      end.to change(CommunicationTemplate, :count).by(1)

      expect(response).to have_http_status(:ok)
    end

    it 'rejects a client admin copying across clients even with access to both' do
      view_only_admin = create(:client_admin, client: client)
      create(:client_admin_membership, user: view_only_admin, client: other_client)
      view_only_admin.memberships.first.grants.update!(
        data: AllowedPermissions::CLIENT_ADMIN_PERMISSIONS.deep_merge(communications: ['view'])
      )
      view_only_admin.memberships.last.grants.update!(
        data: AllowedPermissions::CLIENT_ADMIN_PERMISSIONS.deep_merge(communications: ['view'])
      )
      sign_in view_only_admin

      expect do
        post :copy, params: copy_params(template, target_campaign_id: other_campaign.id)
      end.not_to change(CommunicationTemplate, :count)

      expect(response).to have_http_status(:unprocessable_content)
    end

    it 'rejects a project admin copying between projects in different clients' do
      project_template = create(
        :communication_template,
        level: :project,
        client: client,
        project: project,
        campaign: nil
      )
      project_admin = create(:project_admin, project: project)
      create(:project_admin_membership, user: project_admin, client: other_project)
      sign_in project_admin

      expect do
        post :copy, params: copy_params(project_template, target_project_id: other_project.id)
      end.not_to change(CommunicationTemplate, :count)

      expect(response).to have_http_status(:unprocessable_content)
    end

    it 'rejects a campaign admin copying between campaigns in different clients' do
      campaign_admin = create(:campaign_admin, campaign: campaign)
      create(:campaign_admin_membership, user: campaign_admin, campaign: other_campaign)
      sign_in campaign_admin

      expect do
        post :copy, params: copy_params(template, target_campaign_id: other_campaign.id)
      end.not_to change(CommunicationTemplate, :count)

      expect(response).to have_http_status(:unprocessable_content)
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
