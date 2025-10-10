# frozen_string_literal: true

require 'rails_helper'

describe AI::Tools::Idp::AvailableSkillsAndDevelopmentActions do
  subject { described_class.new(idp_template) }

  let(:user) { create(:user) }
  let!(:client) { create(:tenancy) }
  let!(:membership) { create(:client_admin_membership) }
  let!(:project) { create(:project, parent: membership.client) }
  let!(:skill_settings) do
    { 'technical_client' => 'none', 'technical_global' => 'all',
      'behavioral_client' => 'none', 'behavioral_global' => 'all' }
  end
  let(:idp_template) { create(:idp_template, :published, project: project, skill_settings: skill_settings) }

  let!(:skill1) { create(:skill, name: 'Leadership', skill_type: 'behavioral', project: nil) }
  let!(:skill2) { create(:skill, name: 'Communication', skill_type: 'behavioral', project: nil) }
  let!(:development_action1) { create(:development_action, name: 'Leadership Workshop', skills: [skill1]) }
  let!(:development_action2) { create(:development_action, name: 'Communication Training', skills: [skill2]) }

  describe '#execute' do
    context 'with valid parameters' do
      it 'returns skills with development actions' do
        result = subject.execute(page: 1)

        expect(result).to be_a(Hash)
        expect(result).to have_key(:skills)
        expect(result).to have_key(:meta)
        expect(result[:skills]).to be_an(Array)
        expect(result[:meta]).to be_a(Hash)
      end
    end
  end
end
