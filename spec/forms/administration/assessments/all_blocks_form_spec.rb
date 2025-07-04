# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Administration::Assessments::AllBlocksForm, type: :form do
  describe 'validations' do
    context 'when blocks are empty or nil' do
      it 'is valid with empty blocks array' do
        form = described_class.new(blocks: [])
        expect(form).to be_valid
      end
    end

    context 'when blocks contain non-skills_rater types' do
      let(:regular_blocks) do
        [
          {
            'block_type' => 'regular',
            'name' => 'MC Block',
            'props' => { 'question' => 'Test question?' }
          }
        ]
      end

      it 'is valid and skips validation for unsupported block types' do
        form = described_class.new(blocks: regular_blocks)
        expect(form).to be_valid
      end
    end

    context 'individual skills_rater block validation' do
      context 'when skills_rater block is valid' do
        let(:valid_skills_rater_block) do
          {
            'block_type' => 'skills_rater',
            'name' => 'Valid Block',
            'props' => {
              'skills_config' => {
                'technical' => {
                  'enabled' => true,
                  'job_roles' => %w[current_job_role target_job_role]
                },
                'behavioral' => {
                  'enabled' => true,
                  'job_roles' => ['current_job_role']
                }
              }
            }
          }
        end

        it 'is valid' do
          form = described_class.new(blocks: [valid_skills_rater_block])
          expect(form).to be_valid
        end
      end

      context 'when skills_rater block is invalid' do
        let(:invalid_skills_rater_block) do
          {
            'block_type' => 'skills_rater',
            'name' => 'Invalid Block',
            'props' => {
              'skills_config' => {
                'technical' => {
                  'enabled' => false,
                  'job_roles' => []
                },
                'behavioral' => {
                  'enabled' => false,
                  'job_roles' => []
                }
              }
            }
          }
        end

        it 'is invalid and includes individual block errors' do
          form = described_class.new(blocks: [invalid_skills_rater_block])
          expect(form).not_to be_valid
          expect(form.errors[:base]).to include(match(/at least one skill type must be enabled/i))
        end
      end

      context 'when skills_rater block has missing props' do
        let(:block_without_props) do
          {
            'block_type' => 'skills_rater',
            'name' => 'No Props Block'
          }
        end

        it 'is invalid' do
          form = described_class.new(blocks: [block_without_props])
          expect(form).not_to be_valid
          expect(form.errors[:base]).not_to be_empty
        end
      end
    end

    context 'duplicate skills_rater configurations' do
      context 'when there are no duplicates' do
        let(:unique_blocks) do
          [
            {
              'block_type' => 'skills_rater',
              'name' => 'Block 1',
              'props' => {
                'skills_config' => {
                  'technical' => {
                    'enabled' => true,
                    'job_roles' => ['current_job_role']
                  }
                }
              }
            },
            {
              'block_type' => 'skills_rater',
              'name' => 'Block 2',
              'props' => {
                'skills_config' => {
                  'behavioral' => {
                    'enabled' => true,
                    'job_roles' => ['current_job_role']
                  }
                }
              }
            },
            {
              'block_type' => 'skills_rater',
              'name' => 'Block 3',
              'props' => {
                'skills_config' => {
                  'other' => {
                    'enabled' => true,
                    'job_roles' => ['target_job_role']
                  }
                }
              }
            }
          ]
        end

        it 'is valid' do
          form = described_class.new(blocks: unique_blocks)
          expect(form).to be_valid
        end
      end

      context 'when there are duplicate configurations' do
        let(:duplicate_blocks) do
          [
            {
              'block_type' => 'skills_rater',
              'name' => 'Block 1',
              'props' => {
                'skills_config' => {
                  'technical' => {
                    'enabled' => true,
                    'job_roles' => ['current_job_role']
                  }
                }
              }
            },
            {
              'block_type' => 'skills_rater',
              'name' => 'Block 2',
              'props' => {
                'skills_config' => {
                  'technical' => {
                    'enabled' => true,
                    'job_roles' => ['target_job_role']
                  }
                }
              }
            }
          ]
        end

        it 'is invalid and shows duplicate error' do
          form = described_class.new(blocks: duplicate_blocks)
          expect(form).not_to be_valid
          expect(form.errors[:base]).to include(
            I18n.t('activemodel.errors.models.all_blocks_form.attributes.base.duplicate_block',
                   block_name: 'Block 2',
                   duplicate_configurations: 'Technical')
          )
        end
      end

      context 'when there are multiple duplicates in one block' do
        let(:multiple_duplicate_block) do
          [
            {
              'block_type' => 'skills_rater',
              'name' => 'Block 1',
              'props' => {
                'skills_config' => {
                  'technical' => {
                    'enabled' => true,
                    'job_roles' => ['current_job_role']
                  },
                  'behavioral' => {
                    'enabled' => true,
                    'job_roles' => ['target_job_role']
                  }
                }
              }
            },
            {
              'block_type' => 'skills_rater',
              'name' => 'Block 2',
              'props' => {
                'skills_config' => {
                  'technical' => {
                    'enabled' => true,
                    'job_roles' => ['target_job_role']
                  },
                  'behavioral' => {
                    'enabled' => true,
                    'job_roles' => ['current_job_role']
                  }
                }
              }
            }
          ]
        end

        it 'shows all duplicate configurations for that block' do
          form = described_class.new(blocks: multiple_duplicate_block)
          expect(form).not_to be_valid
          expect(form.errors[:base]).to include(
            I18n.t('activemodel.errors.models.all_blocks_form.attributes.base.duplicate_block',
                   block_name: 'Block 2',
                   duplicate_configurations: 'Technical and Behavioral')
          )
        end
      end

      context 'edge cases' do
        context 'when props is missing' do
          let(:missing_props_block) do
            [
              {
                'block_type' => 'skills_rater',
                'name' => 'Block1'
              }
            ]
          end

          it 'handles missing props gracefully' do
            form = described_class.new(blocks: missing_props_block)
            expect(form).not_to be_valid
            expect(form.errors[:base]).to include(
              I18n.t('activemodel.errors.models.skills_rater_block_form.attributes.base.props_missing',
                     block_name: 'Block1')
            )
          end
        end
      end
    end
  end

  describe 'integration with SkillsRaterBlockForm' do
    let(:skills_rater_block) do
      {
        'block_type' => 'skills_rater',
        'name' => 'Test Block',
        'props' => {
          'skills_config' => {
            'technical' => {
              'enabled' => true,
              'job_roles' => ['invalid_role']
            }
          }
        }
      }
    end

    it 'calls SkillsRaterBlockForm and includes its errors' do
      form = described_class.new(blocks: [skills_rater_block])
      expect(form).not_to be_valid
      expect(form.errors[:base]).to include(
        I18n.t('activemodel.errors.models.skills_rater_block_form.attributes.base.invalid_job_role_type',
               job_role: 'invalid_role',
               skill_type: 'Technical',
               valid_options: 'current_job_role, target_job_role',
               block_name: 'Test Block')
      )
    end

    context 'no skill types enabled' do
      let(:no_skill_types_enabled_block) do
        [
          {
            'block_type' => 'skills_rater',
            'name' => 'Valid Block',
            'props' => {
              'skills_config' => {
                'technical' => {
                  'enabled' => true,
                  'job_roles' => ['current_job_role']
                }
              }
            }
          },
          {
            'block_type' => 'skills_rater',
            'name' => 'Invalid Block',
            'props' => {
              'skills_config' => {
                'technical' => {
                  'enabled' => false,
                  'job_roles' => []
                }
              }
            }
          }
        ]
      end

      it 'validates all blocks' do
        form = described_class.new(blocks: no_skill_types_enabled_block)
        expect(form).not_to be_valid
        expect(form.errors[:base]).to include(
          I18n.t('activemodel.errors.models.skills_rater_block_form.attributes.base.at_least_one_skill_type_must_be_enabled_with_a_job_role_selected', # rubocop:disable Layout/LineLength
                 block_name: 'Invalid Block')
        )
      end
    end
  end
end
