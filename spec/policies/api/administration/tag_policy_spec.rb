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
  options = { filter: { taggable_resource_type: 'Assessment' } }

  describe 'index?' do
    context 'when user is superadmin, client_admin, or project_admin' do
      it 'allows access' do
        [superadmin, client_admin, project_admin, campaign_admin].each do |admin|
          expect(described_class.new(admin, nil, options).index?).to be_truthy
        end
      end
    end

    context 'when user is not superadmin, client_admin, or project_admin' do
      it 'denies access' do
        expect(described_class.new(user, nil, options).index?).to be_falsey
      end
    end
  end

  describe 'Scope' do
    let(:superadmin_scope) { described_class::Scope.new(superadmin, nil, options) }

    let(:client_admin_scope) { described_class::Scope.new(client_admin, nil, options) }

    context 'for superadmin user' do
      it 'returns all tags' do
        set_current_user(superadmin)

        assessment.add_tag('psychometric')
        assessment.save

        expect(superadmin_scope.resolve.count).to eq 1
        expect(superadmin_scope.resolve).to include(have_attributes(name: 'psychometric'))
      end
    end

    context 'for non-superadmin user' do
      it 'returns tags for specific tenants and common' do
        set_current_user(client_admin)
        assessment.update_column(:owner_id, client_admin.owner_ids.first)

        assessment.add_tag('psychometric')
        assessment.add_tag('non-superadmin')
        assessment.save

        expect(client_admin_scope.resolve.count).to eq 2
        expect(client_admin_scope.resolve).to include(have_attributes(name: 'psychometric'))
        expect(client_admin_scope.resolve).not_to include(have_attributes(name: 'new_tag'))
      end
    end
  end
end
