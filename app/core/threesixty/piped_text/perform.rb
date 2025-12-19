# frozen_string_literal: true

module Threesixty
  module PipedText
    class Perform < ::PipedText::BasePerform
      def self.branches
        ::PipedText::BranchData.branches
      end
    end
  end
end
