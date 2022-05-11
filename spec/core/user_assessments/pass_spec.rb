# frozen_string_literal: true

require 'rails_helper'

describe UserAssessments::Pass do
  describe 'timed assessment' do
    let(:user_assessment) do
      create(
        :user_assessment,
        evaluator: build(:user, project: create(:project)),
        assessment: build(:assessment, extra: { timer: 10 }),
        additional_time: 20
      )
    end

    it 'status = not_started' do
      user_assessment.status = 'not_started'
      described_class.call!(user_assessment, 'ru')

      expect(user_assessment.status).to eq('not_started')
      expect(user_assessment.selected_locale).to eq('ru')
    end

    it 'status = interrupted' do
      user_assessment.status = 'interrupted'
      described_class.call!(user_assessment, nil)

      expect(user_assessment.status).to eq('in_progress')
      expect(user_assessment.selected_locale).to be_nil
    end

    it 'status = completed' do
      user_assessment.status = 'completed'
      described_class.call!(user_assessment, nil)

      expect(user_assessment.users_result.status).to eq('completed')
      expect(user_assessment.selected_locale).to be_nil
      expect(user_assessment.expiry_date).to be_nil
    end
  end

  describe 'not timed assessment' do
    let(:user_assessment) do
      create(
        :user_assessment,
        evaluator: build(:user, project: create(:project)),
        assessment: build(:assessment, extra: { timer: nil }),
        additional_time: 20
      )
    end

    it 'status = not_started' do
      user_assessment.status = 'not_started'
      described_class.call!(user_assessment, 'ru')

      expect(user_assessment.status).to eq('in_progress')
      expect(user_assessment.selected_locale).to eq('ru')
      expect(user_assessment.expiry_date).to eq(nil)
    end

    it 'status = interrupted' do
      user_assessment.status = 'interrupted'
      described_class.call!(user_assessment, nil)

      expect(user_assessment.status).to eq('in_progress')
      expect(user_assessment.selected_locale).to be_nil
      expect(user_assessment.expiry_date).to eq(20.seconds.from_now)
    end

    it 'status = completed' do
      user_assessment.status = 'completed'
      described_class.call!(user_assessment, nil)

      expect(user_assessment.users_result.status).to eq('completed')
      expect(user_assessment.selected_locale).to be_nil
      expect(user_assessment.expiry_date).to be_nil
    end
  end

  describe 'not timed assessment with instructions' do
    let(:user_assessment) do
      create(
        :user_assessment,
        evaluator: build(:user, project: create(:project)),
        assessment: build(:assessment, extra: { timer: nil }, instructions: { enabled: true }),
        additional_time: 20
      )
    end

    it 'status = not_started' do
      user_assessment.status = 'not_started'
      described_class.call!(user_assessment, 'ru')

      expect(user_assessment.status).to eq('not_started')
      expect(user_assessment.selected_locale).to eq('ru')
      expect(user_assessment.expiry_date).to eq(nil)
    end

    it 'status = interrupted' do
      user_assessment.status = 'interrupted'
      described_class.call!(user_assessment, nil)

      expect(user_assessment.status).to eq('in_progress')
      expect(user_assessment.selected_locale).to be_nil
      expect(user_assessment.expiry_date).to eq(20.second.from_now)
    end

    it 'status = completed' do
      user_assessment.status = 'completed'
      described_class.call!(user_assessment, nil)

      expect(user_assessment.status).to eq('completed')
      expect(user_assessment.selected_locale).to be_nil
      expect(user_assessment.expiry_date).to be_nil
    end
  end
end
