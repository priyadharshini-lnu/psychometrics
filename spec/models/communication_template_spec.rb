# frozen_string_literal: true

require 'rails_helper'

RSpec.describe CommunicationTemplate, type: :model do
  describe 'subject/body presence' do
    it 'allows a draft template with blank subject and body' do
      template = build(:communication_template, status: :draft, subject: nil, body: nil)

      expect(template).to be_valid
    end

    it 'requires subject and body once the template is active' do
      template = build(:communication_template, status: :active, subject: nil, body: nil)

      expect(template).not_to be_valid
      expect(template.errors[:subject]).to be_present
      expect(template.errors[:body]).to be_present
    end

    it 'is valid when active with subject and body present' do
      template = build(:communication_template, status: :active, subject: 'Hello', body: 'Welcome')

      expect(template).to be_valid
    end
  end
end
