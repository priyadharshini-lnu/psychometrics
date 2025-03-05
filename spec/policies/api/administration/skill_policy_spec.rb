# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::Administration::SkillPolicy do
  let(:superadmin) { create(:superadmin) }
  let(:client_admin) { create(:client_admin) }
  let(:project_admin) { create(:project_admin) }
  let(:campaign_admin) { create(:campaign_admin) }
  let(:user) { create(:user) }

  let(:project) { Project.find(create(:project).id) }
  let(:global_skill) { create(:skill, project: nil) }
  let(:project_skill) { create(:skill, project: project) }
  let(:other_project_skill) { create(:skill, project: Project.find(create(:project).id)) }

  describe 'superadmin permissions' do
    subject { described_class.new(superadmin, nil) }

    %i[index? create? update? destroy? show? import? tags_search? add_tag? remove_tag?].each do |permission|
      it "allows #{permission}" do
        expect(subject.public_send(permission)).to be_truthy
      end
    end
  end

  describe 'search?' do
    context 'when user has required permissions' do
      before do
        allow(user).to receive(:has_permission?).with(:skills, :view).and_return(true)
      end

      it 'allows access' do
        expect(described_class.new(user, nil).search?).to be_truthy
      end
    end

    context 'when user lacks required permissions' do
      before do
        allow(user).to receive(:has_permission?).with(:skills, :view).and_return(false)
        allow(user).to receive(:has_permission?).with(:skills, :manage).and_return(false)
      end

      it 'denies access' do
        expect(described_class.new(user, nil).search?).to be_falsey
      end
    end
  end

  describe 'Scope' do
    let(:superadmin_scope) { described_class::Scope.new(superadmin, Skill.all) }
    let(:user_scope) { described_class::Scope.new(user, Skill.all) }

    context 'for superadmin user' do
      before do
        allow(superadmin).to receive(:superadmin?).and_return(true)
      end

      it 'returns all skills' do
        global_skill
        project_skill
        other_project_skill

        expect(superadmin_scope.resolve).to include(global_skill, project_skill, other_project_skill)
      end
    end

    context 'for user with required permissions' do
      let(:campaign) { create(:campaign, project: project) }

      before do
        allow(user).to receive(:has_permission?).with(:skills, :view).and_return(true)
        allow(user).to receive(:has_permission?).with(:skills, :manage).and_return(true)
        allow(user).to receive(:client_admin_project_ids).and_return([project.id])
        allow(user).to receive(:project_admin_client_ids).and_return([])
        allow(user).to receive(:campaign_admin_campaigns).and_return([])
      end

      it 'returns global skills and skills from accessible projects' do
        global_skill
        project_skill
        other_project_skill

        resolved_scope = user_scope.resolve
        expect(resolved_scope).to include(global_skill, project_skill)
        expect(resolved_scope).not_to include(other_project_skill)
      end
    end

    context 'for user without required permissions' do
      before do
        allow(user).to receive(:has_permission?).with(:skills, :view).and_return(false)
        allow(user).to receive(:has_permission?).with(:skills, :manage).and_return(false)
      end

      it 'returns no skills' do
        global_skill
        project_skill

        expect(user_scope.resolve).to be_empty
      end
    end
  end
end
