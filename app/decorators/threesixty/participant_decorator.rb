# frozen_string_literal: true

module Threesixty
  class ParticipantDecorator < BaseDecorator
    def status_btn_class
      return '' if object.manager_evaluation_status == 'waiting'

      object.manager_evaluation_status == 'approved' ? 'btn-success' : 'btn-danger'
    end
  end
end
