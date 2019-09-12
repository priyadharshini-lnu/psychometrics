# frozen_string_literal: true

module Administration
  module Threesixty
    class ReportPolicy < BasePolicy
      alias download? show?
      alias export? show?
    end
  end
end
