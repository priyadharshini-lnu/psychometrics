# frozen_string_literal: true

require 'rails_helper'

describe Tenantable do
  let(:tenant_a) { create(:tenancy) }
  let(:tenant_b) { create(:tenancy) }
  let(:project_a) { create(:project, parent: tenant_a) }
  let(:project_b) { create(:project, parent: tenant_b) }
  let!(:campaign_a) { create(:campaign, project: project_a) }
  let!(:campaign_b) { create(:campaign, project: project_b) }

  describe 'query isolation by tenant' do
    it 'returns only records belonging to the current tenant' do
      ActsAsTenant.with_tenant(tenant_a) do
        expect(Campaign.all).to include(campaign_a)
        expect(Campaign.all).not_to include(campaign_b)
      end
    end

    it 'returns records for a different tenant when tenant switches' do
      ActsAsTenant.with_tenant(tenant_b) do
        expect(Campaign.all).to include(campaign_b)
        expect(Campaign.all).not_to include(campaign_a)
      end
    end

    it 'returns all records when no tenant is set' do
      ActsAsTenant.current_tenant = nil
      expect(Campaign.all).to include(campaign_a, campaign_b)
    end
  end

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

    context 'AdminJobRecord (direct acts_as_tenant, no Tenantable inference)' do
      it 'assigns tenant_id from current_tenant on create' do
        owner = create(:user, project: project_a)
        admin_job_record = ActsAsTenant.with_tenant(tenant_a) do
          create(:admin_job_record, owner: owner)
        end

        expect(admin_job_record.tenant_id).to eq(tenant_a.id)
      end

      it 'leaves tenant_id nil when no current_tenant is set' do
        owner = create(:user, project: project_a)
        admin_job_record = create(:admin_job_record, owner: owner)

        expect(admin_job_record.tenant_id).to be_nil
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
      campaign = create(:campaign, project: project_a)
      expect(campaign.tenant_id).to eq(tenant_a.id)

      ActsAsTenant.with_tenant(tenant_b) do
        expect { campaign.update!(name: 'renamed') }.
          not_to(change { campaign.reload.tenant_id })
      end
    end
  end

  describe 'cross-tenant record visibility' do
    it 'cannot find a record from another tenant within a scoped block' do
      ActsAsTenant.with_tenant(tenant_a) do
        expect(Campaign.find_by(id: campaign_b.id)).to be_nil
      end
    end
  end

  describe 'has_global_records: true, optional: true config' do
    let!(:global_dimension)     { create(:dimension) }
    let!(:dimension_for_a)      { create(:dimension, owner: project_a) }
    let!(:dimension_for_b)      { create(:dimension, owner: project_b) }

    it 'includes global records (nil tenant_id) in a tenant-scoped query' do
      ActsAsTenant.with_tenant(tenant_a) do
        expect(Dimension.all).to include(global_dimension)
      end
    end

    it 'includes only the tenant own record alongside global records' do
      ActsAsTenant.with_tenant(tenant_a) do
        expect(Dimension.all).to include(global_dimension, dimension_for_a)
        expect(Dimension.all).not_to include(dimension_for_b)
      end
    end

    it 'leaves tenant_id nil for global records with no owner' do
      expect(global_dimension.tenant_id).to be_nil
    end

    it 'infers tenant_id from owner when owner is a sub-client' do
      expect(dimension_for_a.tenant_id).to eq(tenant_a.id)
    end

    context 'child records via tenant_source' do
      it 'inherits tenant_id from a tenant-scoped parent' do
        occupation = create(:occupation, dimension: dimension_for_a)
        expect(occupation.tenant_id).to eq(tenant_a.id)
      end

      it 'leaves tenant_id nil when the parent dimension is global' do
        occupation = create(:occupation, dimension: global_dimension)
        expect(occupation.tenant_id).to be_nil
      end

      it 'inherits tenant_id for InnovationStyle via its dimension' do
        style = create(:innovation_style, dimension: dimension_for_a)
        expect(style.tenant_id).to eq(tenant_a.id)
      end
    end
  end

  describe 'tenant_id sync on parent association change' do
    let(:assessment) { create(:assessment, owner: tenant_a) }

    it 'updates tenant_id when owner_id changes (superadmin context)' do
      expect(assessment.tenant_id).to eq(tenant_a.id)

      assessment.skip_owner_validation = true
      assessment.update!(owner: tenant_b)
      expect(assessment.tenant_id).to eq(tenant_b.id)
    end

    it 'keeps tenant_id as current_tenant when current_tenant is set' do
      ActsAsTenant.with_tenant(tenant_a) do
        assessment.skip_owner_validation = true
        assessment.owner = tenant_b
        assessment.valid?
        expect(assessment.tenant_id).to eq(tenant_a.id)
      end
    end

    it 'does not sync when non-tenant columns change' do
      original_tenant = assessment.tenant_id
      assessment.update!(name: 'Updated Name')
      expect(assessment.tenant_id).to eq(original_tenant)
    end
  end

  describe 'without has_global_records' do
    it 'excludes nil-tenant records from a tenant-scoped query' do
      session = AI::AssistedUserSession.new(resource: nil, assistable: nil, user: create(:user))
      session.save(validate: false)

      ActsAsTenant.with_tenant(tenant_a) do
        expect(AI::AssistedUserSession.where(id: session.id)).to be_empty
      end
    end
  end

  describe 'assessment and report models (default strict scoping)' do
    context 'UserAssessment with tenant_source via campaign_id' do
      it 'infers tenant_id from the campaign' do
        user_assessment = create(:user_assessment, campaign: campaign_a)
        expect(user_assessment.tenant_id).to eq(tenant_a.id)
      end

      it 'is isolated to the correct tenant' do
        ua_a = create(:user_assessment, campaign: campaign_a)
        ua_b = create(:user_assessment, campaign: campaign_b)

        ActsAsTenant.with_tenant(tenant_a) do
          expect(UserAssessment.all).to include(ua_a)
          expect(UserAssessment.all).not_to include(ua_b)
        end
      end
    end

    context 'UserReport with tenant_source via campaign_id' do
      it 'infers tenant_id from the campaign' do
        user_report = create(:user_report, campaign: campaign_a)
        expect(user_report.tenant_id).to eq(tenant_a.id)
      end

      it 'is isolated to the correct tenant' do
        report_a = create(:user_report, campaign: campaign_a)
        report_b = create(:user_report, campaign: campaign_b)

        ActsAsTenant.with_tenant(tenant_a) do
          expect(UserReport.all).to include(report_a)
          expect(UserReport.all).not_to include(report_b)
        end
      end
    end
  end
end
