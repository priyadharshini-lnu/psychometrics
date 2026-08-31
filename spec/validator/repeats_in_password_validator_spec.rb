# frozen_string_literal: true

require 'rails_helper'

describe RepeatsInPasswordValidator do
  with_model :user do
    table do |t|
      t.string :password
    end

    model do
      validate :validate_password_repeats

      private

      def validate_password_repeats
        RepeatsInPasswordValidator.new(attributes: [:password]).validate_each(self, :password, password)
      end
    end
  end

  it 'character repeated 3 or more times should be invalid' do
    expect(User.new(password: '111').valid?).to eq(false)
    expect(User.new(password: 'aaaa').valid?).to eq(false)
  end

  it 'substring of length 3 repeated 2 or more times should be invalid' do
    expect(User.new(password: 'tomtom').valid?).to eq(false)
    expect(User.new(password: 'jack@jack').valid?).to eq(false)
    expect(User.new(password: '102102').valid?).to eq(false)
  end

  it 'is invalid if it contains alphabetical or numeric sequences of 3 or more characters' do
    expect(User.new(password: 'abc').valid?).to eq(false)
    expect(User.new(password: 'monopq').valid?).to eq(false)
    expect(User.new(password: '123').valid?).to eq(false)
    expect(User.new(password: '2345').valid?).to eq(false)
  end

  it 'valid cases' do
    expect(User.new(password: '112233').valid?).to eq(true)
    expect(User.new(password: 'abxymn12').valid?).to eq(true)
    expect(User.new(password: 'somepassword').valid?).to eq(false)
    expect(User.new(password: '987').valid?).to eq(true)
    expect(User.new(password: 'cba').valid?).to eq(true)
  end
end
