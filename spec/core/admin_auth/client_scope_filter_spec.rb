# frozen_string_literal: true

require 'rails_helper'

RSpec.describe AdminAuth::ClientScopeFilter do
  describe '.apply' do
    let(:client) { create(:tenancy) }
    let(:project) { create(:project, parent: client) }
    let(:other_client) { create(:tenancy) }
    let(:other_project) { create(:project, parent: other_client) }

    context 'when client is nil' do
      it 'returns the scope unchanged' do
        scope = Client.all
        expect(described_class.apply(scope, nil)).to eq(scope)
      end
    end

    context 'with Client scope' do
      it 'returns only the client and its subtree' do
        project
        other_project
        result = described_class.apply(Client.all, client)
        expect(result).to include(client, project)
        expect(result).not_to include(other_client, other_project)
      end
    end

    context 'with Campaign scope' do
      it 'returns only campaigns belonging to the client subtree' do
        campaign = create(:campaign, project_id: project.id)
        other_campaign = create(:campaign, project_id: other_project.id)

        result = described_class.apply(Campaign.all, client)
        expect(result).to include(campaign)
        expect(result).not_to include(other_campaign)
      end
    end

    context 'with User scope' do
      it 'returns users by project_id or membership in the client subtree' do
        user_by_project = create(:user, project: project)
        user_by_membership = create(:user)
        create(:membership, user: user_by_membership, client: project)
        other_user = create(:user, project: other_project)

        result = described_class.apply(User.all, client)
        expect(result).to include(user_by_project)
        expect(result).to include(user_by_membership)
        expect(result).not_to include(other_user)
      end
    end

    context 'with Assessment scope' do
      it 'returns only assessments owned by the client subtree' do
        assessment = create(:assessment, owner: client)
        other_assessment = create(:assessment, owner: other_client)

        result = described_class.apply(Assessment.all, client)
        expect(result).to include(assessment)
        expect(result).not_to include(other_assessment)
      end
    end

    context 'with Dimension scope' do
      it 'returns only dimensions owned by the client subtree' do
        dimension = create(:dimension, owner: client)
        other_dimension = create(:dimension, owner: other_client)

        result = described_class.apply(Dimension.all, client)
        expect(result).to include(dimension)
        expect(result).not_to include(other_dimension)
      end
    end

    context 'with Report scope' do
      it 'returns only reports owned by the client subtree' do
        report = create(:report, owner: client)
        other_report = create(:report, owner: other_client)

        result = described_class.apply(Report.all, client)
        expect(result).to include(report)
        expect(result).not_to include(other_report)
      end
    end

    context 'with generic owner_id detection' do
      it 'filters models with owner_id column by client subtree' do
        norm = create(:norm, owner: client)
        other_norm = create(:norm, owner: other_client)

        result = described_class.apply(Norm.all, client)
        expect(result).to include(norm)
        expect(result).not_to include(other_norm)
      end
    end

    context 'with polymorphic owner (DevelopmentAction)' do
      let(:user) { create(:user) }

      it 'includes records where owner_type is Client and owner_id is in the subtree' do
        owned = create(:development_action, owner: project)
        other_owned = create(:development_action, owner: other_project)

        result = described_class.apply(DevelopmentAction.all, client)
        expect(result).to include(owned)
        expect(result).not_to include(other_owned)
      end

      it 'excludes records where owner_type is not Client' do
        user_owned = create(:development_action, owner: user)

        result = described_class.apply(DevelopmentAction.all, client)
        expect(result).not_to include(user_owned)
      end
    end

    context 'with non-Client owner (AdminJobRecord)' do
      it 'does not compare owner_id against client subtree IDs and returns scope unchanged' do
        record = create(:admin_job_record, owner: create(:user))

        result = described_class.apply(AdminJobRecord.all, client)
        expect(result).to include(record)
      end
    end

    context 'with generic client_id detection' do
      it 'filters models with client_id column by client subtree' do
        audit_log = create(:audit_log, client: project)
        other_audit_log = create(:audit_log, client: other_project)

        result = described_class.apply(AuditLog.all, client)
        expect(result).to include(audit_log)
        expect(result).not_to include(other_audit_log)
      end
    end

    context 'with generic campaign_id detection' do
      it 'filters models with campaign_id column by client subtree' do
        campaign = create(:campaign, project_id: project.id)
        other_campaign = create(:campaign, project_id: other_project.id)
        user_assessment = create(:user_assessment, campaign: campaign)
        other_user_assessment = create(:user_assessment, campaign: other_campaign)

        result = described_class.apply(UserAssessment.all, client)
        expect(result).to include(user_assessment)
        expect(result).not_to include(other_user_assessment)
      end
    end

    context 'with model that has no client column' do
      it 'returns the scope unchanged' do
        scope = ActsAsTaggableOn::Tag.all
        expect(described_class.apply(scope, client)).to eq(scope)
      end
    end
  end
end
