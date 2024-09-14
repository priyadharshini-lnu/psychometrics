# frozen_string_literal: true

require 'rails_helper'

describe Assessors::CreateAllForm do
  let(:project) { create(:project) }
  let(:campaign) { create(:campaign, project: project) }
  describe '.call' do
    it 'duplicated subject+assessor emails' do
      assessors = [
        { subject_email: 'a@a.com', assessor_email: 'b@b.com' },
        { subject_email: 'a@a.com', assessor_email: 'b@b.com' }
      ]
      form = described_class.new(assessors: assessors)
      form.with_context(campaign: campaign)
      form.validate
      expect(form.errors.messages[:assessors].first).to include('The subject and assessor emails are duplicated')
    end

    it 'failed email' do
      assessors = [
        { subject_email: 'a', assessor_email: 'am' }
      ]
      form = described_class.new(assessors: assessors)
      form.with_context(campaign: campaign)
      form.validate
      expect(form.errors.messages[:assessors].first).to include('[Row 1] Assessor Email is invalid')
    end

    it 'returns a validation error when the assessors array is empty' do
      assessors = []
      form = described_class.new(assessors: assessors)
      form.with_context(campaign: campaign)
      form.validate

      expect(form.errors.messages[:assessors].first).to include('Select at least one assessor')
    end
  end
end
