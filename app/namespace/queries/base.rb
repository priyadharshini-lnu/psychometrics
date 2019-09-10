# frozen_string_literal: true

module Queries
  class Base
    class << self
      delegate :call, to: :new
    end

    def initialize
      raise "You must override #initialize in class #{self.class.name}"
    end

    def call
      raise "You must override #perform in class #{self.class.name}"
    end

    def sanitize_sql_array(array)
      ActiveRecord::Base.send(:sanitize_sql_array, array)
    end
  end
end
