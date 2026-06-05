# frozen_string_literal: true

require 'rails_helper'

describe Tenantable do
  let(:tenant_a) { create(:tenancy) }
  let(:tenant_b) { create(:tenancy) }
  let(:project_a) { create(:project, parent: tenant_a) }
  let(:project_b) { create(:project, parent: tenant_b) }
  let!(:campaign_a) { create(:campaign, project: project_a) }
  let!(:campaign_b) { create(:campaign, project: project_b) }

  describe 'tenant_id inference from parent associations' do
    context 'via project_id' do
      it 'infers tenant_id from the project root' do
        campaign = create(:campaign, project: project_a)
        expect(campaign.tenant_id).to eq(tenant_a.id)
      end
    end

    context 'via campaign_id' do
      it 'infers tenant_id through campaign → project → root' do
        assessor = create(:assessor, campaign: campaign_a)
        expect(assessor.tenant_id).to eq(tenant_a.id)
      end
    end

    context 'via threesixty_campaign_id' do
      it 'infers tenant_id from the threesixty campaign tenant' do
        threesixty_campaign = create(:threesixty_campaign, campaign: campaign_a)
        email_schedule = create(:threesixty_email_schedule, threesixty_campaign: threesixty_campaign)
        expect(email_schedule.tenant_id).to eq(tenant_a.id)
      end
    end

    context 'via client_id' do
      it 'infers tenant_id from the client root' do
        user = create(:user)
        membership = create(:membership, client: project_a, user: user)
        expect(membership.tenant_id).to eq(tenant_a.id)
      end
    end

    context 'via polymorphic owner (owner_type used to resolve class)' do
      it 'infers tenant_id when owner is a Client' do
        development_action = create(:development_action, owner: project_a)

        expect(development_action.tenant_id).to eq(tenant_a.id)
      end

      it 'leaves tenant_id nil when owner is nil' do
        development_action = create(:development_action, :global)

        expect(development_action.tenant_id).to be_nil
      end
    end

    context 'via polymorphic tenant_source (:transcribable)' do
      it 'infers tenant_id from the transcribable record tenant_id' do
        media_response = create(:media_response)
        media_response.update_column(:tenant_id, tenant_a.id)

        transcription = create(:transcription, transcribable: media_response)

        expect(transcription.tenant_id).to eq(tenant_a.id)
      end

      it 'leaves tenant_id nil when the transcribable has no tenant' do
        media_response = create(:media_response)
        media_response.update_column(:tenant_id, nil)

        transcription = create(:transcription, transcribable: media_response)

        expect(transcription.tenant_id).to be_nil
      end
    end

    context 'via tenant_source with an array of associations (tries each in order)' do
      it 'infers tenant_id from the first association that resolves' do
        user_assessment = create(:user_assessment, campaign: campaign_a)
        # user_assessment_factor_score has tenant_source :user_assessment as first in chain
        factor_score = create(:user_assessment_factor_score, user_assessment: user_assessment,
                                                             factor: create(:factor))
        expect(factor_score.tenant_id).to eq(tenant_a.id)
      end

      it 'falls back to the next association when the first resolves to nil' do
        # AI::AssistedUserSession has tenant_source %i[resource assistable user]
        # resource is optional (nil here), assistable resolves the tenant
        campaign = create(:campaign, project: project_a)
        user = create(:user)
        session = AI::AssistedUserSession.new(resource: nil, assistable: campaign, user: user)
        session.valid?
        expect(session.tenant_id).to eq(tenant_a.id)
      end

      it 'falls back to the last association when earlier ones do not resolve' do
        # resource is nil, assistable is a record without tenant context, user resolves
        user = create(:user, project: project_a)
        session = AI::AssistedUserSession.new(resource: nil, assistable: create(:user), user: user)
        session.valid?
        expect(session.tenant_id).to eq(tenant_a.id)
      end

      it 'is inherited by STI subclasses without redeclaring tenant_source' do
        expect(AI::CampaignArtifactResult.tenant_source_association).to eq(AI::AssistedUserSession.tenant_source_association)
        expect(AI::AssistedUserDevelopmentActionsSession.tenant_source_association).to eq(AI::AssistedUserSession.tenant_source_association)
      end
    end

    context 'via tenant_source' do
      it 'infers tenant_id through the declared source association' do
        user_assessment = create(:user_assessment, campaign: campaign_a)
        factor_score = create(:user_assessment_factor_score, user_assessment: user_assessment,
                                                             factor: create(:factor))
        expect(factor_score.tenant_id).to eq(tenant_a.id)
      end
    end

    it 'does not overwrite an already-set tenant_id' do
      campaign = create(:campaign, project: project_a, tenant_id: tenant_b.id)
      expect(campaign.tenant_id).to eq(tenant_b.id)
    end
  end
end
