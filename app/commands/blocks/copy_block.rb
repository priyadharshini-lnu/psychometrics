# frozen_string_literal: true

module Blocks
  class CopyBlock < BaseCommand
    private_attr_reader :block_id, :block, :new_name, :owner_id

    def initialize(block_id, new_name: nil, owner_id: nil)
      @block_id = block_id
      @new_name = new_name
      @owner_id = owner_id
    end

    def call
      @block = Block.find(block_id)

      new_block = ActiveRecord::Base.transaction do
        copied_block = block.clone
        copied_block.name = new_name if new_name.present?
        copied_block.owner_id = owner_id if owner_id.present?
        copied_block.save!

        copy_translations(block, copied_block)

        block.questions.each do |question|
          Questions::CopyQuestion.new(question.id).
            on(:ok) { |new_question| new_question.update!(block_id: copied_block.id) }.
            on(:error) do |error|
            if error.is_a?(ActiveRecord::Base)
              raise(ActiveRecord::RecordInvalid, error)
            else
              raise(ActiveRecord::RecordNotFound)
            end
          end.call
        end

        copied_block
      end

      broadcast :ok, new_block
    rescue ActiveRecord::RecordInvalid => e
      broadcast(:error, e.record)
    rescue ActiveRecord::RecordNotFound
      broadcast(:error, block_id)
    end

    private

    def copy_translations(original, copy)
      original.translations.each do |translation|
        new_translation = translation.dup
        new_translation.translateable_id = copy.id
        new_translation.save!
      end
    end
  end
end
