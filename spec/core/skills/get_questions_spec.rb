# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Skills::GetQuestions do
  let(:superadmin) { create(:superadmin) }
  let(:client) do
    create(:client,
           number: '123',
           country: 'UAE',
           year: '2024',
           project_manager: superadmin)
  end
  let(:project) { create(:project, client: client) }
  let(:campaign) { create(:campaign, project: project, status: :active) }
  let(:user) { create(:user, project: project) }
  let!(:campaign_user) { create(:campaign_user, campaign: campaign, user: user) }

  let(:current_job_role) { create(:job_role, project: project) }
  let(:target_job_role) { create(:job_role, project: project) }

  let!(:technical_skill) do
    create(:skill, project: Project.find(project.id), skill_type: 'technical', name: 'Technical Skill')
  end
  let!(:behavioral_skill) do
    create(:skill, project: Project.find(project.id), skill_type: 'behavioral', name: 'Behavioral Skill')
  end
  let!(:leadership_skill) do
    create(:skill, project: Project.find(project.id), skill_type: 'other', name: 'Leadership Skill')
  end

  let!(:current_technical_skill_job_role) do
    create(:skills_job_role, project: project, job_role: current_job_role, skill: technical_skill)
  end
  let!(:current_behavioral_skill_job_role) do
    create(:skills_job_role, project: project, job_role: current_job_role, skill: behavioral_skill)
  end
  let!(:target_behavioral_skill_job_role) do
    create(:skills_job_role, project: project, job_role: target_job_role, skill: behavioral_skill)
  end
  let!(:target_leadership_skill_job_role) do
    create(:skills_job_role, project: project, job_role: target_job_role, skill: leadership_skill)
  end

  let(:technical_question) { technical_skill.question }
  let(:behavioral_question) { behavioral_skill.question }
  let(:leadership_question) { leadership_skill.question }

  before do
    campaign_user.update!(
      current_job_role_id: current_job_role.id,
      target_job_role_id: target_job_role.id
    )
  end

  describe '#call' do
    context 'when technical and behavioral skills are enabled' do
      let(:skills_config) do
        {
          'technical' => {
            'enabled' => true,
            'job_roles' => ['current_job_role']
          },
          'behavioral' => {
            'enabled' => true,
            'job_roles' => ['target_job_role']
          }
        }
      end

      it 'returns questions for specified skill types from respective job roles' do
        result = described_class.call!(skills_config, campaign_user)
        questions = result[:questions]

        expect(questions).to include(technical_question, behavioral_question)
        expect(questions).not_to include(leadership_question)
        expect(questions.count).to eq(2)
      end
    end

    context 'when a skill type has multiple job roles' do
      let(:skills_config) do
        {
          'technical' => {
            'enabled' => true,
            'job_roles' => %w[current_job_role target_job_role]
          }
        }
      end

      it 'returns questions for the skill type from all specified job roles' do
        result = described_class.call!(skills_config, campaign_user)
        questions = result[:questions]

        expect(questions).to include(technical_question)
        expect(questions).not_to include(behavioral_question, leadership_question)
        expect(questions.count).to eq(1)
      end
    end

    context 'when a skill type is disabled' do
      let(:skills_config) do
        {
          'technical' => {
            'enabled' => false,
            'job_roles' => ['current_job_role']
          },
          'behavioral' => {
            'enabled' => true,
            'job_roles' => ['target_job_role']
          }
        }
      end

      it 'ignores disabled job roles' do
        result = described_class.call!(skills_config, campaign_user)
        questions = result[:questions]

        expect(questions).to include(behavioral_question)
        expect(questions).not_to include(technical_question)
      end
    end

    context 'when campaign_user has no current_job_role_id' do
      let(:skills_config) do
        {
          'technical' => {
            'enabled' => true,
            'job_roles' => ['current_job_role']
          },
          'behavioral' => {
            'enabled' => true,
            'job_roles' => ['target_job_role']
          }
        }
      end

      before do
        campaign_user.update!(current_job_role_id: nil)
      end

      it 'skips current job role and only processes target job role' do
        result = described_class.call!(skills_config, campaign_user)
        questions = result[:questions]

        expect(questions).to include(behavioral_question)
        expect(questions).not_to include(technical_question)
      end
    end

    context 'when no skill types are enabled' do
      let(:skills_config) do
        {
          'technical' => {
            'enabled' => false,
            'job_roles' => ['current_job_role']
          },
          'behavioral' => {
            'enabled' => false,
            'job_roles' => ['target_job_role']
          }
        }
      end

      it 'returns empty questions collection' do
        result = described_class.call!(skills_config, campaign_user)
        questions = result[:questions]

        expect(questions).to be_empty
      end
    end

    context 'when skills_config is nil' do
      let(:skills_config) { nil }

      it 'returns empty questions collection' do
        result = described_class.call!(skills_config, campaign_user)
        questions = result[:questions]

        expect(questions).to be_empty
      end
    end

    context 'when skills_config is empty' do
      let(:skills_config) { {} }

      it 'returns empty questions collection' do
        result = described_class.call!(skills_config, campaign_user)
        questions = result[:questions]

        expect(questions).to be_empty
      end
    end

    context 'when skill types are invalid' do
      let(:skills_config) do
        {
          'invalid_type' => {
            'enabled' => true,
            'job_roles' => ['current_job_role']
          }
        }
      end

      it 'ignores invalid skill types and returns empty questions' do
        result = described_class.call!(skills_config, campaign_user)
        questions = result[:questions]

        expect(questions).to be_empty
      end
    end

    context 'when job role has no associated skills' do
      let(:empty_job_role) { create(:job_role, project: project) }
      let(:skills_config) do
        {
          'technical' => {
            'enabled' => true,
            'job_roles' => ['current_job_role']
          }
        }
      end

      before do
        campaign_user.update!(current_job_role_id: empty_job_role.id)
      end

      it 'returns empty questions collection' do
        result = described_class.call!(skills_config, campaign_user)
        questions = result[:questions]

        expect(questions).to be_empty
      end
    end

    context 'when skills are duplicated across roles' do
      let(:skills_config) do
        {
          'behavioral' => {
            'enabled' => true,
            'job_roles' => %w[current_job_role target_job_role]
          }
        }
      end

      it 'returns unique questions only' do
        result = described_class.call!(skills_config, campaign_user)
        questions = result[:questions]

        expect(questions).to include(behavioral_question)
        expect(questions.count).to eq(1)
      end
    end

    context 'when role type is invalid' do
      let(:skills_config) do
        {
          'technical' => {
            'enabled' => true,
            'job_roles' => ['invalid_role']
          }
        }
      end

      it 'ignores invalid role type' do
        result = described_class.call!(skills_config, campaign_user)
        questions = result[:questions]

        expect(questions).to be_empty
      end
    end
  end
end
