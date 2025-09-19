# frozen_string_literal: true

require 'rails_helper'

describe Idp::DevelopmentAction::SavePlanForm do
  let(:user) { create(:user) }
  let(:idp_template) { create(:idp_template) }
  let(:user_idp_plan) { create(:user_idp_plan, user: user, idp_template: idp_template) }
  let(:skill) { create(:skill) }
  let!(:user_idp_skill) { create(:user_idp_skill, user_idp_plan: user_idp_plan, skill: skill) }
  let!(:development_action) { create(:development_action, name: 'Platform Action', skills: [skill]) }

  let(:valid_attributes) do
    {
      user_idp_skill_id: user_idp_skill.id,
      name: 'Test custom action',
      description: 'Test custom action description',
      learning_style: 'on_the_job',
      source_type: 'custom',
      start_date_time: 1.day.from_now.strftime('%Y-%m-%d %H:%M'),
      end_date_time: 2.days.from_now.strftime('%Y-%m-%d %H:%M'),
      private: false,
      progress: 50
    }
  end

  describe 'validations' do
    context 'platform development actions' do
      let(:platform_attributes) do
        {
          user_idp_skill_id: user_idp_skill.id,
          development_action_id: development_action.id,
          source_type: 'platform',
          start_date_time: 1.day.from_now.strftime('%Y-%m-%d %H:%M'),
          end_date_time: 2.days.from_now.strftime('%Y-%m-%d %H:%M'),
          private: false,
          progress: 50
        }
      end

      it 'is valid for platform development actions without learning_style' do
        form = described_class.new(platform_attributes).with_context(user_idp_plan)
        expect(form.valid?).to be true
      end

      it 'is valid for platform development actions with blank dates' do
        attributes = platform_attributes.merge(start_date_time: '', end_date_time: '')
        form = described_class.new(attributes).with_context(user_idp_plan)
        expect(form.valid?).to be true
      end

      it 'is valid for platform development actions with nil dates' do
        attributes = platform_attributes.merge(start_date_time: nil, end_date_time: nil)
        form = described_class.new(attributes).with_context(user_idp_plan)
        expect(form.valid?).to be true
      end
    end

    context 'date validations' do
      it 'is valid with future dates' do
        form = described_class.new(valid_attributes).with_context(user_idp_plan)
        expect(form.valid?).to be true
      end

      it 'is valid with blank dates' do
        attributes = valid_attributes.merge(start_date_time: '', end_date_time: '')
        form = described_class.new(attributes).with_context(user_idp_plan)
        expect(form.valid?).to be true
      end

      it 'is valid with nil dates' do
        attributes = valid_attributes.merge(start_date_time: nil, end_date_time: nil)
        form = described_class.new(attributes).with_context(user_idp_plan)
        expect(form.valid?).to be true
      end

      it 'is invalid with past start_date_time' do
        past_date = 1.day.ago.strftime('%Y-%m-%d %H:%M')
        attributes = valid_attributes.merge(start_date_time: past_date)
        form = described_class.new(attributes).with_context(user_idp_plan)

        expect(form.valid?).to be false
        expect(form.errors[:start_date_time]).to include('Start date cannot be in the past')
      end

      it 'is invalid with past end_date_time' do
        past_date = 1.day.ago.strftime('%Y-%m-%d %H:%M')
        attributes = valid_attributes.merge(end_date_time: past_date)
        form = described_class.new(attributes).with_context(user_idp_plan)

        expect(form.valid?).to be false
        expect(form.errors[:end_date_time]).to include('End date cannot be in the past')
      end

      it 'is invalid with both past dates' do
        past_start = 2.days.ago.strftime('%Y-%m-%d %H:%M')
        past_end = 1.day.ago.strftime('%Y-%m-%d %H:%M')
        attributes = valid_attributes.merge(start_date_time: past_start, end_date_time: past_end)
        form = described_class.new(attributes).with_context(user_idp_plan)

        expect(form.valid?).to be false
        expect(form.errors[:start_date_time]).to include('Start date cannot be in the past')
        expect(form.errors[:end_date_time]).to include('End date cannot be in the past')
      end

      it 'does not validate past dates if format is invalid' do
        invalid_date = 'invalid-date'
        attributes = valid_attributes.merge(start_date_time: invalid_date)
        form = described_class.new(attributes).with_context(user_idp_plan)

        expect(form.valid?).to be false
        expect(form.errors[:start_date_time]).to include('is invalid')
        expect(form.errors[:start_date_time]).not_to include('Start date cannot be in the past')
      end
    end

    context 'format validations' do
      it 'validates date format for start_date_time' do
        attributes = valid_attributes.merge(start_date_time: 'invalid-format')
        form = described_class.new(attributes).with_context(user_idp_plan)

        expect(form.valid?).to be false
        expect(form.errors[:start_date_time]).to include('is invalid')
      end

      it 'validates date format for end_date_time' do
        attributes = valid_attributes.merge(end_date_time: 'invalid-format')
        form = described_class.new(attributes).with_context(user_idp_plan)

        expect(form.valid?).to be false
        expect(form.errors[:end_date_time]).to include('is invalid')
      end
    end

    context 'other validations' do
      it 'requires user_idp_skill_id' do
        attributes = valid_attributes.merge(user_idp_skill_id: nil)
        form = described_class.new(attributes).with_context(user_idp_plan)

        expect(form.valid?).to be false
        expect(form.errors[:user_idp_skill_id]).to include("can't be blank")
      end

      it 'requires learning_style for custom development actions' do
        attributes = valid_attributes.merge(learning_style: nil, source_type: 'custom')
        form = described_class.new(attributes).with_context(user_idp_plan)

        expect(form.valid?).to be false
        expect(form.errors[:learning_style]).to be_present
      end

      it 'validates learning_style is in allowed values' do
        attributes = valid_attributes.merge(learning_style: 'invalid_style')
        form = described_class.new(attributes).with_context(user_idp_plan)

        expect(form.valid?).to be false
        expect(form.errors[:learning_style]).to be_present
      end

      it 'validates progress is between 0 and 100' do
        attributes = valid_attributes.merge(progress: 150)
        form = described_class.new(attributes).with_context(user_idp_plan)

        expect(form.valid?).to be false
        expect(form.errors[:progress]).to be_present
      end

      it 'validates user_idp_skill exists in the plan' do
        other_user_idp_plan = create(:user_idp_plan, user: create(:user), idp_template: idp_template)
        other_skill = create(:skill)
        other_user_idp_skill = create(:user_idp_skill, user_idp_plan: other_user_idp_plan, skill: other_skill)

        attributes = valid_attributes.merge(user_idp_skill_id: other_user_idp_skill.id)
        form = described_class.new(attributes).with_context(user_idp_plan)

        expect(form.valid?).to be false
        expect(form.errors[:user_idp_skill_id]).to be_present
      end
    end
  end
end
