# frozen_string_literal: true

require 'rails_helper'

RSpec.describe CampaignUsers::GetApplicableSkillIds do
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

  before do
    campaign_user.update!(
      current_job_role_id: current_job_role.id,
      target_job_role_id: target_job_role.id
    )
  end

  describe '#call' do
    context 'when filter is empty' do
      let(:filter) { {} }

      it 'returns an empty array' do
        result = described_class.call!(campaign_user, filter: filter)
        expect(result).to eq([])
      end
    end

    context 'when filter is nil' do
      let(:filter) { nil }

      it 'returns an empty array' do
        result = described_class.call!(campaign_user, filter: filter)
        expect(result).to eq([])
      end
    end

    context 'when filtering by category with technical skills from current job role' do
      let(:filter) do
        {
          by_category: {
            technical: {
              current_job_role: true
            }
          }
        }
      end

      it 'returns technical skill IDs from current job role' do
        result = described_class.call!(campaign_user, filter: filter)
        expect(result).to contain_exactly(technical_skill.id)
      end
    end

    context 'when filtering by category with behavioral skills from target job role' do
      let(:filter) do
        {
          by_category: {
            behavioral: {
              target_job_role: true
            }
          }
        }
      end

      it 'returns behavioral skill IDs from target job role' do
        result = described_class.call!(campaign_user, filter: filter)
        expect(result).to contain_exactly(behavioral_skill.id)
      end
    end

    context 'when filtering by category with multiple skill types' do
      let(:filter) do
        {
          by_category: {
            technical: {
              current_job_role: true
            },
            behavioral: {
              target_job_role: true
            },
            other: {
              target_job_role: true
            }
          }
        }
      end

      it 'returns all skill IDs from specified job roles' do
        result = described_class.call!(campaign_user, filter: filter)
        expect(result).to contain_exactly(
          technical_skill.id,
          behavioral_skill.id,
          leadership_skill.id
        )
      end
    end

    context 'when filtering by category with multiple job roles for same skill type' do
      let(:filter) do
        {
          by_category: {
            behavioral: {
              current_job_role: true,
              target_job_role: true
            }
          }
        }
      end

      it 'returns unique skill IDs from all specified job roles' do
        result = described_class.call!(campaign_user, filter: filter)
        # behavioral_skill is in both job roles, should be returned only once
        expect(result).to contain_exactly(behavioral_skill.id)
      end
    end

    context 'when job role has no skills for the specified skill type' do
      let(:empty_job_role) { create(:job_role, project: project) }
      let(:filter) do
        {
          by_category: {
            technical: {
              current_job_role: true
            }
          }
        }
      end

      before do
        campaign_user.update!(current_job_role_id: empty_job_role.id)
      end

      it 'returns an empty array' do
        result = described_class.call!(campaign_user, filter: filter)
        expect(result).to eq([])
      end
    end

    context 'when campaign_user has no current_job_role_id' do
      let(:filter) do
        {
          by_category: {
            technical: {
              current_job_role: true
            },
            behavioral: {
              target_job_role: true
            }
          }
        }
      end

      before do
        campaign_user.update!(current_job_role_id: nil)
      end

      it 'skips current job role and only processes target job role' do
        result = described_class.call!(campaign_user, filter: filter)
        expect(result).to contain_exactly(behavioral_skill.id)
      end
    end

    context 'when campaign_user has no target_job_role_id' do
      let(:filter) do
        {
          by_category: {
            technical: {
              current_job_role: true
            },
            behavioral: {
              target_job_role: true
            }
          }
        }
      end

      before do
        campaign_user.update!(target_job_role_id: nil)
      end

      it 'skips target job role and only processes current job role' do
        result = described_class.call!(campaign_user, filter: filter)
        expect(result).to contain_exactly(technical_skill.id)
      end
    end

    context 'when job role type is disabled' do
      let(:filter) do
        {
          by_category: {
            technical: {
              current_job_role: false
            },
            behavioral: {
              target_job_role: true
            }
          }
        }
      end

      it 'ignores disabled job roles' do
        result = described_class.call!(campaign_user, filter: filter)
        expect(result).to contain_exactly(behavioral_skill.id)
      end
    end

    context 'when campaign_user is nil' do
      let(:filter) do
        {
          by_category: {
            technical: {
              current_job_role: true
            }
          }
        }
      end

      it 'returns an empty array' do
        result = described_class.call!(nil, filter: filter)
        expect(result).to eq([])
      end
    end
  end
end
