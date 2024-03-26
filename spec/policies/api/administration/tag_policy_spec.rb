# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::Administration::TagPolicy do
  let(:superadmin) { create(:superadmin) }
  let(:client_admin) { create(:client_admin) }
  let(:project_admin) { create(:project_admin) }
  let(:campaign_admin) { create(:campaign_admin) }
  let(:user) { create(:user) }

  let(:project) { create(:project) }
  let(:campaign) { create(:campaign, project: project) }
  let!(:assessment) { create(:assessment) }
  let(:assessment_another_owner) do
    create(:assessment, category: :assessor_form, owner_id: project.parent.id, created_by: superadmin)
  end

  describe 'index?' do
    context 'when user is superadmin, client_admin, or project_admin' do
      it 'allows access' do
        [superadmin, client_admin, project_admin, campaign_admin].each do |admin|
          expect(described_class.new(admin, nil).index?).to be_truthy
        end
      end
    end

    context 'when user is not superadmin, client_admin, or project_admin' do
      it 'denies access' do
        expect(described_class.new(user, nil).index?).to be_falsey
      end
    end
  end

  describe 'Scope' do
    let(:superadmin_scope) { described_class::Scope.new(superadmin, nil) }

    let(:project_admin_scope) { described_class::Scope.new(project_admin, nil) }

    context 'for superadmin user' do
      it 'returns all tags' do
        set_current_user(superadmin)

        assessment.add_tag('psychometric')
        assessment.save

        expect(superadmin_scope.resolve.count).to eq 1
        expect(superadmin_scope.resolve.pluck(:name)).to include('psychometric')
      end
    end

    context 'for non-superadmin user' do
      it 'returns tags for specific tenants and common' do
        set_current_user(project_admin)
        assessment.add_tag('psychometric')
        assessment.save

        assessment_another_owner.add_tag('new_tag')
        assessment_another_owner.save

        expect(project_admin_scope.resolve.count).to eq 1
        expect(project_admin_scope.resolve.pluck(:name)).to include('psychometric')
        expect(project_admin_scope.resolve.pluck(:name)).not_to include('new_tag')
      end
    end
  end
end
