# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Skills::CreateSkillFactorAndQuestion do
  let(:project) { create(:project) }
  let(:skill) { create(:skill, project_id: project.id, name: 'Ruby Programming') }

  describe '#call' do
    it 'creates question and factor for skill with project' do
      expect { described_class.call(skill) }.to change { Question.count }.by(1).
        and change { Factor.count }.by(1)

      command = described_class.new(skill)
      command.call

      expect(command.question).to be_present
      expect(command.question.name).to eq('Ruby Programming Question')
      expect(command.question.skill_id).to eq(skill.id)

      expect(command.factor).to be_present
      expect(command.factor.name).to eq('Ruby Programming')
      expect(command.factor.skill_id).to eq(skill.id)
    end

    it 'returns early for skills without project' do
      skill_without_project = build(:skill, project_id: nil)

      expect { described_class.call(skill_without_project) }.not_to(change { Question.count })
      expect { described_class.call(skill_without_project) }.not_to(change { Factor.count })
    end
  end
end
