# frozen_string_literal: true

module Questions
  class CopyQuestion < BaseCommand
    private_attr_reader :question_id, :question, :new_name, :owner_id

    def initialize(question_id, new_name: nil, owner_id: nil)
      @question_id = question_id
      @new_name = new_name
      @owner_id = owner_id
    end

    def call
      @question = Question.find(question_id)

      new_question = ActiveRecord::Base.transaction do
        copied_question = question.clone
        copied_question.name = new_name if new_name.present?
        copied_question.owner_id = owner_id if owner_id.present?
        copied_question.save!

        %w[factors_scorings question_recodings].each do |association_name|
          copy_association(association_name, question, copied_question)
        end

        copy_translations(question, copied_question)

        copied_question
      end

      broadcast :ok, new_question
    rescue ActiveRecord::RecordInvalid => e
      broadcast(:error, e.record)
    rescue ActiveRecord::RecordNotFound
      broadcast(:error, question_id)
    end

    private

    def copy_association(association_name, original, copy)
      original.send(association_name).each do |item|
        new_item = item.dup
        new_item.question_id = copy.id
        new_item.save!
      end
    end

    def copy_translations(original, copy)
      original.translations.each do |translation|
        new_translation = translation.dup
        new_translation.translateable_id = copy.id
        new_translation.save!
      end
    end
  end
end
