# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Communications::CopyTemplate do
  let(:client) { create(:tenancy) }
  let(:other_client) { create(:tenancy) }
  let(:project) { create(:project, parent: client) }
  let(:target_project) { create(:project, parent: client) }
  let(:other_project) { create(:project, parent: other_client) }
  let(:campaign) { create(:campaign, project: project) }
  let(:target_campaign) { create(:campaign, project: target_project) }
  let(:other_campaign) { create(:campaign, project: other_project) }
  let(:user) { create(:superadmin) }
  let(:parent_template) do
    create(:communication_template, level: :project, client: client, project: project, campaign: nil)
  end
  let(:source_template) do
    create(
      :communication_template,
      name: 'Source template',
      status: :active,
      recipients_default: :selected,
      delivery_defaults: { send_offset_days: 2 },
      client: client,
      project: project,
      campaign: nil,
      level: :project,
      inherits_from_template: parent_template,
      subject: 'Default subject',
      body: 'Default body'
    )
  end

  before do
    Mobility.with_locale(:en) { source_template.update!(subject: 'Default subject', body: 'Default body') }
    Mobility.with_locale(:fr) { source_template.update!(subject: 'Sujet FR', body: 'Corps FR') }
  end

  it 'copies the source template settings to the target scope' do
    copy = described_class.call!(source_template, user, target_project_id: target_project.id)

    expect(copy).to have_attributes(
      name: 'Source template (Copy)',
      kind: source_template.kind,
      level: source_template.level,
      status: source_template.status,
      recipients_default: source_template.recipients_default,
      delivery_defaults: { 'send_offset_days' => 2 },
      client_id: client.id,
      project_id: target_project.id,
      campaign_id: nil,
      inherits_from_template_id: parent_template.id,
      created_by_id: user.id,
      updated_by_id: user.id
    )
  end

  it 'copies every translated subject and body' do
    copy = described_class.call!(source_template, user, target_project_id: target_project.id)

    expect(Mobility.with_locale(:en) { copy.subject }).to eq('Default subject')
    expect(Mobility.with_locale(:en) { copy.body }).to eq('Default body')
    expect(Mobility.with_locale(:fr) { copy.subject }).to eq('Sujet FR')
    expect(Mobility.with_locale(:fr) { copy.body }).to eq('Corps FR')
  end

  it 'copies campaign templates within the client' do
    source_template.update_columns(level: :campaign, project_id: project.id, campaign_id: campaign.id)

    copy = described_class.call!(source_template, user, target_campaign_id: target_campaign.id)

    expect(copy).to have_attributes(
      level: 'campaign',
      client_id: client.id,
      project_id: target_project.id,
      campaign_id: target_campaign.id
    )
  end

  it 'does not copy client templates' do
    source_template.update_columns(level: :client, client_id: client.id, project_id: nil, campaign_id: nil)

    expect do
      result = described_class.call(source_template, user, target_project_id: target_project.id)
      expect(result[:error]).to eq(I18n.t('admin.communication_template_client_copy_unsupported'))
    end.not_to change(CommunicationTemplate, :count)
  end

  it 'copies project templates within the client with the target tenant' do
    target_project_id = target_project.id

    copy = ActsAsTenant.with_tenant(client) do
      described_class.call!(source_template, user, target_project_id: target_project_id)
    end

    expect(copy).to have_attributes(
      client_id: client.id,
      project_id: target_project.id,
      tenant_id: client.id
    )
  end

  it 'copies project templates within the same project' do
    copy = described_class.call!(source_template, user, target_project_id: project.id)

    expect(copy).to have_attributes(client_id: client.id, project_id: project.id)
  end

  it 'does not copy project templates to another client' do
    expect do
      result = described_class.call(source_template, user, target_project_id: other_project.id)
      expect(result[:error]).to eq(I18n.t('admin.communication_template_target_client_mismatch'))
    end.not_to change(CommunicationTemplate, :count)
  end

  it 'does not copy campaign templates to another client' do
    source_template.update_columns(level: :campaign, project_id: project.id, campaign_id: campaign.id)

    expect do
      result = described_class.call(source_template, user, target_campaign_id: other_campaign.id)
      expect(result[:error]).to eq(I18n.t('admin.communication_template_target_client_mismatch'))
    end.not_to change(CommunicationTemplate, :count)
  end

  it 'does not copy platform templates' do
    source_template.update_columns(level: :platform, client_id: nil, project_id: nil, campaign_id: nil)

    expect do
      result = described_class.call(source_template, user)
      expect(result[:error]).to eq(I18n.t('admin.communication_template_platform_copy_unsupported'))
    end.not_to change(CommunicationTemplate, :count)
  end
end
