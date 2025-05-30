# frozen_string_literal: true

require 'rails_helper'

RSpec.describe IdpTemplates::SkillsOrTagsPresenceValidator do
  let(:context) do
    {
      behavioral_global_skill_settings: 'selected',
      behavioural_global_tags: nil,
      behavioral_client_skill_settings: 'none',
      behavioural_client_tags: nil,
      technical_global_skill_settings: 'none',
      technical_global_tags: nil,
      technical_client_skill_settings: 'none',
      technical_client_tags: nil
    }
  end

  let(:skills) { [] }
  let(:project_id) { 1 }
  let(:validator) { described_class.new(context, skills, project_id) }
  let!(:skill) { create(:skill, skill_type: 'behavioral', project_id: nil) }

  describe '#call' do
    context 'when tags are blank and skills are not present' do
      it 'adds errors and broadcasts errors' do
        result = described_class.call(context, skills, project_id)
        expect(result[:errors]).to include(:behavioral_global_skill_settings)
      end
    end

    context 'validates' do
      it 'return no error if skills present' do
        skills = [
          {
            id: skill.id,
            type: 'skills'
          }
        ]
        result = described_class.call(context, skills, project_id)
        expect(result[:errors]).to be_nil
      end

      it 'return no error if tags present' do
        context[:behavioural_global_tags] = %w[tag1 tag2]
        result = described_class.call(context, skills, project_id)
        expect(result[:errors]).to be_nil
      end
    end
  end
end
