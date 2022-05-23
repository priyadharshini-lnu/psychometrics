# frozen_string_literal: true

require 'rails_helper'

describe RepeatsInPasswordValidator do
  with_model :user do
    table do |t|
      t.string :password
    end

    model do
      validates :password, repeats_in_password: true
    end
  end

  it 'containing sequences should be invalid' do
    expect(User.new(password: '11111111').valid?).to be_falsy
    expect(User.new(password: '12345').valid?).to be_falsy
    expect(User.new(password: '9876543').valid?).to be_falsy
    expect(User.new(password: 'abcdef').valid?).to be_falsy
    expect(User.new(password: 'fedcba').valid?).to be_falsy
    expect(User.new(password: '12345678').valid?).to be_falsy
    expect(User.new(password: '87654321').valid?).to be_falsy
  end

  it 'repeating characters and words should be invalid' do
    expect(User.new(password: 'aaaaaaaa').valid?).to be_falsy
    expect(User.new(password: 'aaaaaabbbbbb').valid?).to be_falsy
    expect(User.new(password: 'qwerqwer').valid?).to be_falsy
    expect(User.new(password: 'passwordpassword').valid?).to be_falsy
    expect(User.new(password: '12341234').valid?).to be_falsy
  end

  it 'password without sequences should be valid' do
    expect(User.new(password: '124578').valid?).to be_truthy
    expect(User.new(password: 'abdete').valid?).to be_truthy
  end
end
