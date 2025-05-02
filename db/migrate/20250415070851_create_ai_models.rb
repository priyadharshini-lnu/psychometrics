# frozen_string_literal: true

class CreateAIModels < ActiveRecord::Migration[7.1]
  def change
    create_table :ai_assistants do |t|
      t.string :name, null: false
      t.string :action, null: false
      t.string :description, null: false
      t.timestamps
    end

    create_table :ai_assistant_configs do |t|
      t.string :name, null: false
      t.string :model, null: false
      t.string :endpoint, null: false
      t.string :api_key, null: false
      t.integer :hourly_rate_limit
      t.references :ai_assistant, foreign_key: true
      t.timestamps
    end

    create_table :ai_assistant_prompts do |t|
      t.text :user_prompt, null: false
      t.text :system_prompt, null: false
      t.references :owner, null: true, foreign_key: { to_table: :clients }
      t.references :last_modified_by, foreign_key: { to_table: :users }
      t.references :ai_assistant, foreign_key: true
      t.boolean :is_default, default: false
      t.timestamps
    end

    create_table :ai_assistant_usages do |t|
      t.references :user, null: false, foreign_key: true
      t.references :ai_assistant, foreign_key: true
      t.bigint :total_token_usage, default: 0, null: false
      t.references :license_usage, foreign_key: true, null: true
      t.timestamps
    end

    create_table :ai_assistant_requests do |t|
      t.bigint :input_tokens
      t.bigint :output_tokens
      t.bigint :total_tokens
      t.references :ai_assistant_usage, foreign_key: true, null: false
      t.string :request_body_checksum
      t.timestamps
    end

    create_table :client_ai_assistants do |t|
      t.references :ai_assistant, foreign_key: true, null: false
      t.integer :hourly_rate_limit
      t.references :license, foreign_key: true, null: false
      t.timestamps
    end
  end
end
