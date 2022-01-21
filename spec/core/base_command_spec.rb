# frozen_string_literal: true

require 'rails_helper'

class SuperError < StandardError; end
class SubError < SuperError; end
class RandomError < StandardError; end

class WithSingleRetry < BaseCommand
  retry_on SuperError, attempts: 4

  attr_reader :attempts

  def initialize(pass_after_n_attempts = 10)
    @pass_after_n_attempts = pass_after_n_attempts
    @attempts = 0
  end

  def call
    @attempts += 1
    raise SuperError if @pass_after_n_attempts != @attempts
  end
end

class WithMultipleRetry < BaseCommand
  retry_on SuperError, attempts: 2
  retry_on RandomError

  attr_reader :attempts

  def initialize(exception)
    @exception = exception
    @attempts = 0
  end

  def call
    @attempts += 1
    raise @exception
  end
end

class WithoutRetry < BaseCommand
  attr_reader :attempts

  def initialize
    @attempts = 0
  end

  def call
    @attempts += 1
  end
end

describe 'BaseCommand' do
  describe WithSingleRetry do
    it 'reties after exception is raised' do
      command = described_class.new
      expect do
        command.call
      end.to raise_exception(SuperError)
      # 1 attempt + 4 retries = 5 attempts in total
      expect(command.attempts).to eq(5)
    end

    it 'retries and passes if there is no exception' do
      command = described_class.new(3)
      expect do
        command.call
      end.to_not raise_exception
      expect(command.attempts).to eq(3)
    end
  end

  describe WithMultipleRetry do
    it 'retries on subclass exception' do
      command = described_class.new(SubError)
      expect do
        command.call
      end.to raise_exception(SubError)
      expect(command.attempts).to eq(3)
    end

    it 'number of retries defaults to 1 if attempts not passed' do
      command = described_class.new(RandomError)
      expect do
        command.call
      end.to raise_exception(RandomError)
      expect(command.attempts).to eq(2)
    end
  end

  describe WithoutRetry do
    it 'attempts command only once' do
      command = described_class.new
      command.call
      expect(command.attempts).to eq(1)
    end
  end
end
