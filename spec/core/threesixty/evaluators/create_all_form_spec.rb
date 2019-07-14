# frozen_string_literal: true

require 'rails_helper'

describe Threesixty::Evaluators::CreateAllForm do
  let(:project) { create(:project) }
  let(:campaign) { create(:campaign, project: project) }
  describe '.call' do
    it 'duplicated subject+evaluator emails' do
      evaluators = [
        { subject_email: 'a@a.com', evaluator_email: 'b@b.com' },
        { subject_email: 'a@a.com', evaluator_email: 'b@b.com' }
      ]
      form = described_class.new(evaluators: evaluators)
      form.with_context(campaign: campaign)
      form.validate
      expect(form.errors.messages[:evaluators].first).to include('The subject and evaluator emails are duplicated')
    end
  end
end
