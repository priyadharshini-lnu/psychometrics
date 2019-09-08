# frozen_string_literal: true

require 'rails_helper'

describe Threesixty::ParticipatorByCriteria::ByUserFields do
  let(:threesixty_campaign) { create(:threesixty_campaign) }

  it 'filters participator by name_or_email' do
    subject_with_matching_email = create(:threesixty_subject, user: create(:user, email: 'james@cc.com'))
    subject_with_matching_name = create(:threesixty_subject, user: create(:user, first_name: 'James'))

    subject_without_matching_email = create(:threesixty_subject, user: create(:user, email: 'andrew@cc.com'))
    subject_without_matching_name = create(:threesixty_subject, user: create(:user, first_name: 'Andrew'))

    participators = [subject_with_matching_email, subject_with_matching_name, subject_without_matching_email, subject_without_matching_name]
    criteria_list = [{ 'field' => 'name_or_email', 'comparator' => 'starts_with', 'value' => 'James' }]
    results = described_class.call!(
      threesixty_campaign: threesixty_campaign,
      participators: participators,
      criteria_list: criteria_list
    )

    expect(results).to match_array([subject_with_matching_email, subject_with_matching_name])
  end

  it 'filters participator by first_name' do
    subject_with_matching_first_name = create(:threesixty_subject, user: create(:user, first_name: 'James'))
    subject_without_matching_first_name = create(:threesixty_subject, user: create(:user, first_name: 'Andrew'))

    participators = [subject_with_matching_first_name, subject_without_matching_first_name]
    criteria_list = [{ 'field' => 'first_name', 'comparator' => 'equal', 'value' => 'James' }]
    results = described_class.call!(
      threesixty_campaign: threesixty_campaign,
      participators: participators,
      criteria_list: criteria_list
    )

    expect(results).to match_array([subject_with_matching_first_name])
  end

  it 'filters participator by last_name' do
    subject_with_matching_last_name = create(:threesixty_subject, user: create(:user, last_name: 'Smith'))
    subject_without_matching_last_name = create(:threesixty_subject, user: create(:user, last_name: 'Cole'))

    participators = [subject_with_matching_last_name, subject_without_matching_last_name]
    criteria_list = [{ 'field' => 'last_name', 'comparator' => 'equal', 'value' => 'Smith' }]
    results = described_class.call!(
      threesixty_campaign: threesixty_campaign,
      participators: participators,
      criteria_list: criteria_list
    )

    expect(results).to match_array([subject_with_matching_last_name])
  end

  it 'filters participators by not equals comparator' do
    subject_with_matching_last_name = create(:threesixty_subject, user: create(:user, last_name: 'Smith'))
    subject_without_matching_last_name = create(:threesixty_subject, user: create(:user, last_name: 'Cole'))

    participators = [subject_with_matching_last_name, subject_without_matching_last_name]
    criteria_list = [{ 'field' => 'last_name', 'comparator' => 'not_equal', 'value' => 'Smith' }]
    results = described_class.call!(
      threesixty_campaign: threesixty_campaign,
      participators: participators,
      criteria_list: criteria_list
    )

    expect(results).to match_array([subject_without_matching_last_name])
  end

  it 'filters participator by mutiple user fields' do
    subject_with_matching_details = create(:threesixty_subject, user: create(:user, first_name: 'Smith', email: 'smith@cc.com'))
    subject_with_partial_match = create(:threesixty_subject, user: create(:user, first_name: 'Smith'))
    subject_without_matching_details = create(:threesixty_subject, user: create(:user, first_name: 'Andrew'))

    participators = [subject_with_matching_details, subject_with_partial_match, subject_without_matching_details]
    criteria_list = [
      { 'field' => 'first_name', 'comparator' => 'equal', 'value' => 'Smith' },
      { 'field' => 'email', 'comparator' => 'equal', 'value' => 'smith@cc.com' }
    ]
    results = described_class.call!(
      threesixty_campaign: threesixty_campaign,
      participators: participators,
      criteria_list: criteria_list
    )

    expect(results).to match_array([subject_with_matching_details])
  end

  it 'or condition is used for same field criteria' do
    subject_with_matching_email1 = create(:threesixty_subject, user: create(:user, email: 'james@cc.com'))
    subject_with_matching_email2 = create(:threesixty_subject, user: create(:user, email: 'andrew@cc.com'))

    subject_without_matching_email = create(:threesixty_subject, user: create(:user, email: 'cole@cc.com'))

    participators = [subject_with_matching_email1, subject_with_matching_email2, subject_without_matching_email]
    criteria_list = [
      { 'field' => 'name_or_email', 'comparator' => 'equal', 'value' => 'james@cc.com' },
      { 'field' => 'name_or_email', 'comparator' => 'equal', 'value' => 'andrew@cc.com' }
    ]
    results = described_class.call!(
      threesixty_campaign: threesixty_campaign,
      participators: participators,
      criteria_list: criteria_list
    )

    expect(results).to match_array([subject_with_matching_email1, subject_with_matching_email2])
  end
end
