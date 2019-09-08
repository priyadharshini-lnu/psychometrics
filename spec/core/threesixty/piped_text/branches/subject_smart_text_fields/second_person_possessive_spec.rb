# frozen_string_literal: true

require 'rails_helper'

describe Threesixty::PipedText::Branches::SubjectSmartTextFields::SecondPersonPossessive do
  describe '.call' do
    let(:project) { create(:project) }
    let(:subject) { create(:user, first_name: 'Vasiliy', last_name: 'Pupkin', email: 'my@email.com', project: project) }
    let(:evaluator) { create(:user, project: project) }

    it do
      response = described_class.call!(%w[SecondPersonPossessive], {}, subject: subject, evaluator: evaluator)
      expect(response).to eq('Vasiliy Pupkin’s')
    end
    it do
      response = described_class.call!(%w[SecondPersonPossessive], {}, subject: subject, evaluator: subject)
      expect(response).to eq('Your')
    end
  end
end
