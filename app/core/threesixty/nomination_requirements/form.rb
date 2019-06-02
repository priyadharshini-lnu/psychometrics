# frozen_string_literal: true

module Threesixty
  module NominationRequirements
    class Form < Rectify::Form
      attribute :name, String
      attribute :position, Integer
      attribute :conditions, Array
      attribute :subject_conditions, Array
    end
  end
end
