# frozen_string_literal: true

module Administration
  module Threesixty
    class ReportPolicy < BasePolicy
      alias_method :download?, :show?
      alias_method :export?, :show?
    end
  end
end
