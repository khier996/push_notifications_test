class CreateWebhooks < ActiveRecord::Migration[5.1]
  def change
    create_table :webhooks do |t|
      t.string :event_id
      t.boolean :sent, default: false

      t.timestamps
    end
  end
end
