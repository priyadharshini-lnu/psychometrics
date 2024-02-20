# frozen_string_literal: true

require 'rails_helper'

RSpec.describe RegexConstants do
  it 'defines DOMAIN_REGEX' do
    expect(RegexConstants::DOMAIN_REGEX).to be_a(Regexp)
  end

  it 'defines SHEET_COLUMN_REGEX' do
    expect(RegexConstants::SHEET_COLUMN_REGEX).to be_a(Regexp)
  end

  it 'defines LUA_VARIABLE' do
    expect(RegexConstants::LUA_VARIABLE).to be_a(Regexp)
  end

  it 'defines LUA_GLOBLA_VAR' do
    expect(RegexConstants::LUA_GLOBLA_VAR).to be_a(Regexp)
  end

  it 'matches good statements with LUA_VARIABLE' do
    statements = %w[
      hello
      hello_5
    ]
    statements.each do |statement|
      expect(statement).to match(RegexConstants::LUA_VARIABLE)
    end
  end

  it 'does not match bad statements with LUA_VARIABLE' do
    statements = [
      'hello world',
      '5hello',
      'hello 5',
      'hello=5',
      'hello= 5',
      'hello = 5',
      'hello-5'
    ]
    statements.each do |statement|
      expect(statement).not_to match(RegexConstants::LUA_VARIABLE)
    end
  end

  it 'matches good statements with LUA_GLOBLA_VAR' do
    statements = [
      'hello = "world"',
      'hello = 1',
      'hello = 1.0',
      'hello= 1.0',
      'hello=1.0',
      'hello_5 = 1.0'
    ]
    statements.each do |statement|
      expect(statement).to match(RegexConstants::LUA_GLOBLA_VAR)
    end
  end

  it 'does not match bad statements with LUA_GLOBLA_VAR' do
    statements = [
      'hello = ',
      'hello',
      'hello == "world"',
      'hello = 1.0.0',
      'hello 5 = 1',
      'hello world = 1',
      '5hello = 1'
    ]
    statements.each do |statement|
      expect(statement).not_to match(RegexConstants::LUA_GLOBLA_VAR)
    end
  end
end
