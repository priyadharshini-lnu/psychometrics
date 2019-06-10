# frozen_string_literal: true

module Threesixty
  module NominationRequirements
    class SaveForm < Rectify::Form
      attribute :name, String
      attribute :position, Integer
      attribute :conditions, Array
      attribute :subject_conditions, Array

      validates :name, presence: true
      validates :position, presence: true
    end
  end
end
