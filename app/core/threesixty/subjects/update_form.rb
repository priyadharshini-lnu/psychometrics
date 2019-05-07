# frozen_string_literal: true

module Threesixty
  module Subjects
    class UpdateForm < Rectify::Form
      attribute :report_release_status, Integer
      attribute :evaluation_completed, Boolean
    end
  end
end
