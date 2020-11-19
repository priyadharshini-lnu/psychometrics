# frozen_string_literal: true

module AdminJobs
  class Base < BaseCommand
    private_attr_reader :record, :owner

    def initialize(record)
      @record = record
      @owner = record.owner
    end
  end
end
