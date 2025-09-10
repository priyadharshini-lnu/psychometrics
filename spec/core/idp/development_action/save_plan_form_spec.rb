# frozen_string_literal: true

require 'rails_helper'

describe Idp::DevelopmentAction::SavePlanForm do
  let(:user) { create(:user) }
  let(:idp_template) { create(:idp_template) }
  let(:user_idp_plan) { create(:user_idp_plan, user: user, idp_template: idp_template) }
  let(:skill) { create(:skill) }
  let!(:user_idp_skill) { create(:user_idp_skill, user_idp_plan: user_idp_plan, skill: skill) }

  let(:valid_attributes) do
    {
      user_idp_skill_id: user_idp_skill.id,
      custom_action: 'Test custom action',
      custom_action_learning_style: 'on_the_job',
      start_date_time: 1.day.from_now.strftime('%Y-%m-%d %H:%M'),
      end_date_time: 2.days.from_now.strftime('%Y-%m-%d %H:%M'),
      private: false,
      progress: 50
    }
  end

  describe 'validations' do
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
    end
  end
end
