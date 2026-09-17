# frozen_string_literal: true

require 'rails_helper'

RSpec.describe CommunicationDecorator do
  describe '#recipients' do
    it 'uses the completion-specific renamed labels for the completion kind' do
      expect(Communication.new(kind: 'completion', recipients: 'all').decorate.recipients).to eq('All Subjects')
      expect(Communication.new(kind: 'completion', recipients: 'selected').decorate.recipients).
        to eq('Selected Subjects')
      expect(Communication.new(kind: 'completion', recipients: 'selected_admins').decorate.recipients).
        to eq('Selected Admins')
      expect(Communication.new(kind: 'completion', recipients: 'selected_assessors').decorate.recipients).
        to eq('Selected Assessors')
    end

    it 'humanizes (space-separated, not underscored) for every other kind, unchanged in meaning' do
      expect(Communication.new(kind: 'invitation', recipients: 'new_users').decorate.recipients).to eq('New users')
      expect(Communication.new(kind: 'reminder', recipients: 'new_assignment').decorate.recipients).
        to eq('New assignment')
      expect(Communication.new(kind: 'other', recipients: 'selected').decorate.recipients).to eq('Selected')
    end
  end

  describe '#show_recipient_users_list?' do
    it 'is true for recipient types backed by an explicit user selection' do
      expect(Communication.new(recipients: 'selected').decorate.show_recipient_users_list?).to be(true)
      expect(Communication.new(recipients: 'selected_admins').decorate.show_recipient_users_list?).to be(true)
      expect(Communication.new(recipients: 'selected_assessors').decorate.show_recipient_users_list?).to be(true)
    end

    it 'is false for recipient types without an explicit user selection' do
      expect(Communication.new(recipients: 'all').decorate.show_recipient_users_list?).to be(false)
      expect(Communication.new(recipients: 'new_users').decorate.show_recipient_users_list?).to be(false)
      expect(Communication.new(recipients: 'new_assignment').decorate.show_recipient_users_list?).to be(false)
    end
  end

  describe '#users_list_label' do
    it 'uses the completion-specific "Recipients List" label for the completion kind' do
      expect(Communication.new(kind: 'completion').decorate.users_list_label).to eq('Recipients List:')
    end

    it 'uses the generic "Users" label for every other kind' do
      expect(Communication.new(kind: 'invitation').decorate.users_list_label).to eq('Users:')
    end
  end
end
