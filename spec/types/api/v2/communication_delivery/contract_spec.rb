# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::CommunicationDelivery::Contract do
  let(:client) { create(:tenancy) }
  let(:project) { create(:project, parent: client) }
  let(:campaign) { create(:campaign, project: project) }

  let(:contract) { described_class.new(schema: Api::V2::CommunicationDelivery::Schema.create_request) }

  def params_for(template, attributes: {}, relationships: {})
    jsonapi_resource_request(
      'communication_deliveries',
      { trigger_type: 'manual' }.merge(attributes),
      {
        communication_template: { id: template.id.to_s, type: 'communication_templates' },
        campaign: { id: campaign.id.to_s, type: 'campaigns' }
      }.merge(relationships)
    )
  end

  describe 'report_available' do
    let(:template) do
      create(:communication_template, kind: :report_available, level: :campaign,
                                       client: client, project: project, campaign: campaign)
    end

    it 'is valid with just a template and campaign' do
      result = contract.call(params_for(template))
      expect(result.failure?).to eq(false)
    end

    it 'rejects a delivery_rule' do
      result = contract.call(params_for(template, attributes: { delivery_rule: 'send_now' }))
      expect(result.failure?).to eq(true)
      expect(result.errors.to_hash[:data]).to include('delivery_rule is not valid for template kind report_available')
    end

    it 'rejects recipients' do
      result = contract.call(params_for(template, attributes: { recipients: 'all' }))
      expect(result.failure?).to eq(true)
      expect(result.errors.to_hash[:data]).to include('recipients is not valid for template kind report_available')
    end
  end

  describe 'completion' do
    let(:template) do
      create(:communication_template, kind: :completion, level: :campaign,
                                       client: client, project: project, campaign: campaign)
    end

    it 'is valid with just a template and campaign' do
      result = contract.call(params_for(template))
      expect(result.failure?).to eq(false)
    end

    it 'is valid with a single selected assessment' do
      assessment = create(:assessment)
      create(:campaign_assessment, campaign: campaign, assessment: assessment)

      result = contract.call(params_for(
                               template,
                               attributes: {
                                 communication_delivery_assessments_attributes: [{ assessment_id: assessment.id.to_s }]
                               }
                             ))

      expect(result.failure?).to eq(false)
    end

    it 'rejects more than one selected assessment' do
      assessment_one = create(:assessment)
      assessment_two = create(:assessment)
      create(:campaign_assessment, campaign: campaign, assessment: assessment_one)
      create(:campaign_assessment, campaign: campaign, assessment: assessment_two)

      result = contract.call(params_for(
                               template,
                               attributes: {
                                 communication_delivery_assessments_attributes: [
                                   { assessment_id: assessment_one.id.to_s }, { assessment_id: assessment_two.id.to_s }
                                 ]
                               }
                             ))

      expect(result.failure?).to eq(true)
      expect(result.errors.to_hash[:data]).to include('completion deliveries support at most one selected assessment')
    end
  end

  describe 'magic_link_email' do
    let(:template) do
      create(:communication_template, kind: :magic_link_email, level: :project,
                                       client: client, project: project, campaign: nil)
    end

    def magic_link_params(attributes: {}, relationships: {})
      jsonapi_resource_request(
        'communication_deliveries',
        { trigger_type: 'manual' }.merge(attributes),
        {
          communication_template: { id: template.id.to_s, type: 'communication_templates' },
          project: { id: project.id.to_s, type: 'clients' }
        }.merge(relationships)
      )
    end

    it 'is valid with just a template and project' do
      result = contract.call(magic_link_params)
      expect(result.failure?).to eq(false)
    end

    it 'rejects a missing project' do
      result = contract.call(magic_link_params(relationships: { project: nil }))
      expect(result.failure?).to eq(true)
      expect(result.errors.to_hash[:data]).to include('project is required for template kind magic_link_email')
    end

    it 'rejects a campaign' do
      result = contract.call(magic_link_params(
                               relationships: { campaign: { id: campaign.id.to_s, type: 'campaigns' } }
                             ))
      expect(result.failure?).to eq(true)
      expect(result.errors.to_hash[:data]).to include('campaign is not valid for template kind magic_link_email')
    end

    it 'rejects a delivery_rule' do
      result = contract.call(magic_link_params(attributes: { delivery_rule: 'send_now' }))
      expect(result.failure?).to eq(true)
    end
  end

  describe 'idp_template_assigned' do
    let(:campaign_template) do
      create(:communication_template, kind: :idp_template_assigned, level: :campaign,
                                       client: client, project: project, campaign: campaign)
    end
    let(:project_template) do
      create(:communication_template, kind: :idp_template_assigned, level: :project,
                                       client: client, project: project, campaign: nil)
    end

    def idp_params(template, attributes: {}, relationships: {})
      jsonapi_resource_request(
        'communication_deliveries',
        { trigger_type: 'manual' }.merge(attributes),
        { communication_template: { id: template.id.to_s, type: 'communication_templates' } }.merge(relationships)
      )
    end

    it 'is valid with just a template and campaign' do
      result = contract.call(idp_params(campaign_template, relationships: {
        campaign: { id: campaign.id.to_s, type: 'campaigns' }
      }))
      expect(result.failure?).to eq(false)
    end

    it 'is valid with just a template and project' do
      result = contract.call(idp_params(project_template, relationships: {
        project: { id: project.id.to_s, type: 'clients' }
      }))
      expect(result.failure?).to eq(false)
    end

    it 'rejects when neither campaign nor project is given' do
      result = contract.call(idp_params(campaign_template))
      expect(result.failure?).to eq(true)
      expect(result.errors.to_hash[:data]).to include(
        'campaign or project is required for template kind idp_template_assigned'
      )
    end

    it 'rejects when both campaign and project are given' do
      result = contract.call(idp_params(campaign_template, relationships: {
        campaign: { id: campaign.id.to_s, type: 'campaigns' },
        project: { id: project.id.to_s, type: 'clients' }
      }))
      expect(result.failure?).to eq(true)
      expect(result.errors.to_hash[:data]).to include(
        'campaign and project cannot both be set for template kind idp_template_assigned'
      )
    end

    it 'rejects a delivery_rule' do
      result = contract.call(idp_params(campaign_template, attributes: { delivery_rule: 'send_now' },
                                                              relationships: {
                                                                campaign: { id: campaign.id.to_s, type: 'campaigns' }
                                                              }))
      expect(result.failure?).to eq(true)
      expect(result.errors.to_hash[:data]).to include(
        'delivery_rule is not valid for template kind idp_template_assigned'
      )
    end

    it 'rejects recipients' do
      result = contract.call(idp_params(campaign_template, attributes: { recipients: 'all' },
                                                              relationships: {
                                                                campaign: { id: campaign.id.to_s, type: 'campaigns' }
                                                              }))
      expect(result.failure?).to eq(true)
      expect(result.errors.to_hash[:data]).to include(
        'recipients is not valid for template kind idp_template_assigned'
      )
    end
  end

  describe 'workshop event-fired kinds' do
    let(:assessment_group) { create(:campaign_assessment_group, campaign: campaign) }
    let(:other_campaign) { create(:campaign, project: project) }

    %w[workshop_invite workshop_booked workshop_cancelled workshop_upcoming_reminder].each do |kind|
      context "for #{kind}" do
        let(:template) do
          create(:communication_template, kind: kind, level: :campaign,
                                           client: client, project: project, campaign: campaign)
        end

        it 'is valid with a template, campaign and campaign_assessment_group_id' do
          result = contract.call(params_for(template, attributes: {
            campaign_assessment_group_id: assessment_group.id
          }))
          expect(result.failure?).to eq(false)
        end

        it 'rejects a missing campaign_assessment_group_id' do
          result = contract.call(params_for(template))
          expect(result.failure?).to eq(true)
          expect(result.errors.to_hash[:data]).to include(
            "campaign_assessment_group_id is required for template kind #{kind}"
          )
        end

        it 'rejects a campaign_assessment_group_id belonging to a different campaign' do
          other_group = create(:campaign_assessment_group, campaign: other_campaign)
          result = contract.call(params_for(template, attributes: {
            campaign_assessment_group_id: other_group.id
          }))
          expect(result.failure?).to eq(true)
          expect(result.errors.to_hash[:data]).to include(
            'campaign_assessment_group_id does not belong to the delivery campaign'
          )
        end

        it 'rejects a delivery_rule' do
          result = contract.call(params_for(template, attributes: {
            campaign_assessment_group_id: assessment_group.id, delivery_rule: 'send_now'
          }))
          expect(result.failure?).to eq(true)
          expect(result.errors.to_hash[:data]).to include("delivery_rule is not valid for template kind #{kind}")
        end

        it 'rejects recipients' do
          result = contract.call(params_for(template, attributes: {
            campaign_assessment_group_id: assessment_group.id, recipients: 'all'
          }))
          expect(result.failure?).to eq(true)
          expect(result.errors.to_hash[:data]).to include("recipients is not valid for template kind #{kind}")
        end
      end
    end
  end

  describe 'invitation (existing behaviour unaffected)' do
    let(:template) do
      create(:communication_template, kind: :invitation, level: :campaign,
                                       client: client, project: project, campaign: campaign)
    end

    it 'still requires a delivery_rule' do
      result = contract.call(params_for(template))
      expect(result.failure?).to eq(true)
      expect(result.errors.to_hash[:data]).to include('delivery_rule is required')
    end

    it 'rejects selected assessments outside of not_completed/completion' do
      assessment = create(:assessment)
      create(:campaign_assessment, campaign: campaign, assessment: assessment)

      result = contract.call(params_for(
                               template,
                               attributes: {
                                 delivery_rule: 'send_now',
                                 communication_delivery_assessments_attributes: [{ assessment_id: assessment.id.to_s }]
                               }
                             ))

      expect(result.failure?).to eq(true)
      expect(result.errors.to_hash[:data]).to include(
        'selected assessments are only valid for delivery_rule not_completed'
      )
    end
  end
end
